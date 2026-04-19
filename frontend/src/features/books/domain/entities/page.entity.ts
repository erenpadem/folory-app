/**
 * Domain Entity: Page
 */
export class PageEntity {
  constructor(
    public readonly id: number,
    public readonly sectionId: number,
    public readonly content: string,
    public readonly order: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static fromPrimitives(data: any): PageEntity {
    if (data == null || typeof data !== 'object') {
      return new PageEntity(0, 0, '', 0, new Date(), new Date());
    }
    const sectionId = data.section_id ?? data.sectionId;
    return new PageEntity(
      Number(data.id),
      Number(sectionId ?? 0),
      data.content != null ? String(data.content) : '',
      data.order ?? 0,
      data.created_at ? new Date(data.created_at) : new Date(),
      data.updated_at ? new Date(data.updated_at) : new Date()
    );
  }

  toPrimitives() {
    return {
      id: this.id,
      section_id: this.sectionId,
      content: this.content,
      order: this.order,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
    };
  }
}

