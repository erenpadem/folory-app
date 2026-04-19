'use client';

import { useState } from 'react';
import { useBookEditorStore } from '../../stores/book-editor.store';
import { getWizardSectionPages } from '../../utils/wizard-section-pages';
import { SectionEntity } from '@/features/books';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, GripVertical, Edit2, Eye, EyeOff } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

function SortableSectionItem({
  section,
  index,
  pageCount,
  onUpdate,
  onDelete,
  onToggleVisibility,
}: {
  section: SectionEntity;
  index: number;
  pageCount: number;
  onUpdate: (id: number, title: string) => void;
  onDelete: (id: number) => void;
  onToggleVisibility: (id: number) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(section.title);

  const handleSave = () => {
    if (title.trim()) {
      onUpdate(section.id, title.trim());
      setIsEditing(false);
    }
  };

  return (
    <Draggable draggableId={section.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={{
            ...provided.draggableProps.style,
            opacity: snapshot.isDragging ? 0.6 : 1,
          }}
          className={`group relative ${
            snapshot.isDragging ? 'z-50' : ''
          }`}
        >
          <Card
            className={`p-4 transition-all duration-200 ${
              snapshot.isDragging
                ? 'border-primary/50 bg-primary/5 shadow-2xl scale-[1.02] rotate-1'
                : snapshot.isDraggingOver
                ? 'border-secondary/50 bg-secondary/5'
                : 'hover:shadow-lg border-border'
            }`}
          >
            <div className="flex items-center gap-4">
              {/* Drag Handle - Only this area triggers drag */}
              <div
                {...provided.dragHandleProps}
                className={`flex-shrink-0 cursor-grab active:cursor-grabbing transition-all select-none touch-none ${
                  snapshot.isDragging
                    ? 'text-primary scale-110'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onMouseDown={(e) => {
                  // Prevent text selection and other interactions while dragging
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <GripVertical className="h-5 w-5" />
              </div>

              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSave();
                      if (e.key === 'Escape') {
                        setTitle(section.title);
                        setIsEditing(false);
                      }
                    }}
                    autoFocus
                    className="h-10"
                  />
                ) : (
                  <div
                    className="cursor-pointer"
                    onClick={() => setIsEditing(true)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground flex-shrink-0">
                        #{index + 1}
                      </span>
                      <h3 className="text-lg font-semibold truncate">{section.title}</h3>
                      {!section.isVisible && (
                        <span className="text-xs bg-muted px-2 py-1 rounded flex-shrink-0">
                          Gizli
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {pageCount} sayfa
                    </p>
                  </div>
                )}
              </div>

              <div className={`flex items-center gap-2 transition-opacity flex-shrink-0 ${
                snapshot.isDragging ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
              }`}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisibility(section.id);
                  }}
                >
                  {section.isVisible ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(section.id);
                  }}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
          
        </div>
      )}
    </Draggable>
  );
}

export function SectionsStep() {
  const {
    sections,
    pages,
    addSection,
    updateSection,
    deleteSection,
    reorderSections,
    setActiveSection,
  } = useBookEditorStore();
  const [newSectionTitle, setNewSectionTitle] = useState('');

  const handleAddSection = () => {
    if (newSectionTitle.trim()) {
      // Use negative ID for temporary client-side entities
      const tempId = -(Date.now() + Math.floor(Math.random() * 1000));
      const now = new Date();
      const newSection = new SectionEntity(
        tempId,
        0,
        newSectionTitle.trim(),
        sections.length,
        0,
        true,
        now,
        now,
        []
      );
      addSection(newSection);
      setNewSectionTitle('');
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const sectionOrders = items.map((s, index) => ({
      id: s.id,
      order: index,
    }));
    reorderSections(sectionOrders);
  };

  const handleToggleVisibility = (id: number) => {
    const section = sections.find((s) => s.id === id);
    if (section) {
      // Create new section with updated visibility
      const now = new Date();
      const updatedSection = new SectionEntity(
        section.id,
        section.bookId,
        section.title,
        section.order,
        section.totalPage,
        !section.isVisible,
        section.createdAt,
        now,
        section.pages
      );
      updateSection(id, updatedSection);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Add Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <Label className="text-lg font-semibold mb-4 block">
            Yeni Bölüm Ekle
          </Label>
          <div className="flex gap-3">
            <Input
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              placeholder="Bölüm başlığı (örn: Bölüm 1 - Başlangıç)"
              className="flex-1 h-12"
              onKeyDown={(e) => e.key === 'Enter' && handleAddSection()}
            />
            <Button onClick={handleAddSection} size="lg" className="h-12">
              <Plus className="h-5 w-5 mr-2" />
              Ekle
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Sections List */}
      <div>
        <Label className="text-lg font-semibold mb-4 block">
          Bölümler ({sections.length})
        </Label>
        {sections.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              Henüz bölüm eklenmedi. Yukarıdan yeni bölüm ekleyebilirsiniz.
            </p>
          </Card>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="sections" type="SECTION">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-3"
                >
                  {sections.map((section, index) => (
                    <SortableSectionItem
                      key={section.id}
                      section={section}
                      index={index}
                      pageCount={getWizardSectionPages(section, pages).length}
                      onUpdate={(id, title) => {
                        const section = sections.find((s) => s.id === id);
                        if (section) {
                          const updatedSection = new SectionEntity(
                            section.id,
                            section.bookId,
                            title,
                            section.order,
                            section.totalPage,
                            section.isVisible,
                            section.createdAt,
                            new Date(),
                            section.pages
                          );
                          updateSection(id, updatedSection);
                        }
                      }}
                      onDelete={deleteSection}
                      onToggleVisibility={handleToggleVisibility}
                    />
                  ))}
                  {/* Drop zone placeholder - shows where item will be dropped */}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    </div>
  );
}
