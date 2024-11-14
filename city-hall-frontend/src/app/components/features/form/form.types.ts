import { ValidatorFn } from "@angular/forms";

export const SCHEMA_PROPERTIES_TYPES = {
    STRING: 'string',
    OBJECT: 'object'
} as const;

export type SchemaStringProperties = {
    type: typeof SCHEMA_PROPERTIES_TYPES.STRING;
    contentEncoding?: string;
    description?: string;
    pattern?: string;
    format?: string;
};

export type SchemaObjectProperties = {
    type: typeof SCHEMA_PROPERTIES_TYPES.OBJECT;
    required?: string[];
    properties: {
        [key: string]: SchemaStringProperties
    };
};

export type SchemaProperties = {
    [key: string]: SchemaStringProperties | SchemaObjectProperties;
};

export type FormDataSchema = {
    properties: SchemaProperties;
    required: string[];
    title: string;
};

export type FormFieldConfig = {
    label?: string;
    validators?: ValidatorFn[];
    required: boolean;
    options?: string[];
    key: string;
};

export type FormSectionConfig = {
    title: string;
    fields: FormFieldConfig[];
};

export type FormConfig = {
    sections: FormSectionConfig[];
};