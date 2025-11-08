import MedicalImageUpload from '@/components/patient/MedicalImageUpload'

export default function MedicalImagesPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Medical Image Analysis
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Upload photos of skin conditions, wounds, or rashes for AI-powered preliminary assessment
        </p>
      </div>

      <MedicalImageUpload />
    </div>
  )
}
