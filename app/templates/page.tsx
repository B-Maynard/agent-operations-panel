import { TemplateList } from '@/components/templates/TemplateList'

export default function TemplatesPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-xl font-semibold">Templates</h1>
      <p className="mb-6 mt-1 text-sm text-[#8b949e]">
        Save reusable command templates with variables. Write once, dispatch with customized
        parameters.
      </p>
      <TemplateList />
    </div>
  )
}