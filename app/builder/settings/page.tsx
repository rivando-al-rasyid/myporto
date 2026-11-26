import { saveSettings } from '@/app/builder/actions'
import { FormError, TextAreaField, TextField } from '@/components/cms/fields'
import { PageBody, PageHeader } from '@/components/cms/page-header'
import { SubmitButton } from '@/components/cms/submit-button'
import type { SiteSettings } from '@/lib/cms'
import { createClient } from '@/lib/supabase/server'

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>
}) {
  const { error, saved } = await searchParams
  const db = await createClient()
  const { data } = await db.from('site_settings').select('*').eq('id', 'default').maybeSingle()
  const s = data as SiteSettings | null

  return (
    <PageBody>
      <PageHeader title="Site settings" description="Hero and navigation text on the public homepage." />
      <FormError message={error} />
      {saved ? <p className="text-xs text-muted-foreground">Saved.</p> : null}

      <form action={saveSettings} className="grid max-w-3xl gap-4">
        <TextField label="Site name" name="site_name" required defaultValue={s?.site_name} />
        <TextField label="Hero badge" name="hero_badge" defaultValue={s?.hero_badge} />
        <TextField label="Hero title" name="hero_title" defaultValue={s?.hero_title} />
        <TextAreaField label="Hero description" name="hero_description" rows={4} defaultValue={s?.hero_description} />
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="Primary button label" name="primary_cta_label" defaultValue={s?.primary_cta_label} />
          <TextField label="Primary button link" name="primary_cta_href" defaultValue={s?.primary_cta_href} />
          <TextField label="Secondary button label" name="secondary_cta_label" defaultValue={s?.secondary_cta_label} />
          <TextField label="Secondary button link" name="secondary_cta_href" defaultValue={s?.secondary_cta_href} />
        </div>
        <div>
          <SubmitButton>Save settings</SubmitButton>
        </div>
      </form>
    </PageBody>
  )
}
