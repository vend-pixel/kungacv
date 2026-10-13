import { TemplateAccess, TemplateSchema } from './template.schema';
import { model } from 'mongoose';

const TemplateModel = model('TemplateSchemaTest', TemplateSchema);

describe('TemplateSchema', () => {
  it('requires the fields needed to publish a template', () => {
    const document = new TemplateModel();
    const error = document.validateSync();
    expect(error?.errors.uid).toBeDefined();
    expect(error?.errors.slug).toBeDefined();
    expect(error?.errors.name).toBeDefined();
    expect(error?.errors.config).toBeDefined();
    expect(error?.errors.createdBy).toBeDefined();
    expect(error?.errors.updatedBy).toBeDefined();
  });

  it('rejects unsupported access values', () => {
    const document = new TemplateModel({
      uid: 'tpl_1',
      slug: 'classic',
      name: 'Classic',
      version: 1,
      config: { customization: {} },
      access: 'enterprise',
      createdBy: 'admin_1',
      updatedBy: 'admin_1',
    });
    const error = document.validateSync();
    expect(error?.errors.access).toBeDefined();
    expect(document.version).toBe(1);
    expect(TemplateAccess.FREE).toBe('free');
    expect(TemplateAccess.PAID).toBe('paid');
  });

  it('declares publication indexes', () => {
    const indexes = TemplateSchema.indexes().map(([fields]) => fields);
    expect(indexes).toEqual(
      expect.arrayContaining([
        { active: 1, published: 1, sortOrder: 1 },
        { packageUids: 1, active: 1, published: 1 },
      ]),
    );
  });
});
