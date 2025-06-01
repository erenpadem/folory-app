import React, { useState } from 'react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Plus, X } from 'lucide-react'
import { Badge } from '../ui/badge'

export const TagManager = () => {

    const [tags, setTags] = useState<string[]>([])
    const [newTag, setNewTag] = useState('')
    const addTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()])
            setNewTag('')
        }
    }

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove))
    }

    return (
        <div className="space-y-2">
            <Label>Etiketler</Label>
            <div className="flex gap-2">
                <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Etiket ekle"
                    onKeyDown={(e) => e.key === 'Enter' && addTag()}
                />
                <Button variant="outline" size="icon" onClick={addTag}>
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
            <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                            onClick={() => removeTag(tag)}
                            className="ml-1"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}
            </div>
        </div>
    )
}


