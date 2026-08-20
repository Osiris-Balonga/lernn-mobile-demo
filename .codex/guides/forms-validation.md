# Forms & Validation Rules (TanStack Form + Zod v4)

## Form Creation Pattern

```typescript
import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { createStudentSchema } from '../schemas/student.schema'

export function CreateStudentForm() {
  const mutation = useCreateStudent()

  const form = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      classGroupId: '',
    },
    validators: {
      onChange: createStudentSchema,
    },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value)
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <form.Field name="firstName">
        {(field) => (
          <div>
            <Label htmlFor={field.name}>Prénom</Label>
            <Input
              id={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {field.state.meta.errors?.length > 0 && (
              <p className="text-sm text-danger">{field.state.meta.errors[0]}</p>
            )}
          </div>
        )}
      </form.Field>
      {/* ... more fields */}
    </form>
  )
}
```

## Zod Schema Pattern

Schemas live in `features/<name>/schemas/<entity>.schema.ts`:

```typescript
import { z } from 'zod'

export const createStudentSchema = z.object({
  firstName: z.string().min(2, 'Minimum 2 caractères'),
  lastName: z.string().min(2, 'Minimum 2 caractères'),
  dateOfBirth: z.string().date('Date invalide'),
  classGroupId: z.string().uuid('Classe requise'),
  gender: z.enum(['M', 'F']),
})

export type CreateStudentInput = z.infer<typeof createStudentSchema>

// Update schema — partial of create, with id
export const updateStudentSchema = createStudentSchema.partial().extend({
  id: z.string().uuid(),
})
```

## Rules

1. **ALWAYS** define schemas separately from forms (reusable for API validation too)
2. **ALWAYS** use `validators.onChange` for real-time feedback
3. **NEVER** validate manually in submit handler — Zod handles it
4. **USE** `form.Subscribe` for form-level state (isSubmitting, canSubmit):
   ```typescript
   <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
     {([canSubmit, isSubmitting]) => (
       <Button type="submit" disabled={!canSubmit || isSubmitting}>
         {isSubmitting ? 'Saving...' : 'Save'}
       </Button>
     )}
   </form.Subscribe>
   ```
5. **PREFER** field-level validation for expensive checks (async uniqueness):
   ```typescript
   <form.Field
     name="email"
     validators={{
       onChangeAsync: async ({ value }) => {
         const exists = await checkEmailExists(value)
         return exists ? 'Email déjà utilisé' : undefined
       },
       onChangeAsyncDebounceMs: 500,
     }}
   />
   ```
6. **SCHEMA SHARING**: Schemas should mirror the API's expected input shapes. Reference `lernn-api/src/shared/` for field names and types.

## Common Field Components

Build reusable form field wrappers in `src/components/form/`:

```typescript
// src/components/form/form-field.tsx
export function FormField({ form, name, label, ...props }) {
  return (
    <form.Field name={name}>
      {(field) => (
        <div className="space-y-2">
          <Label htmlFor={field.name}>{label}</Label>
          <Input
            id={field.name}
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            {...props}
          />
          <FieldError errors={field.state.meta.errors} />
        </div>
      )}
    </form.Field>
  )
}
```
