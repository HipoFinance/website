import { useState } from 'react'

export default function Hipo404() {
    const [preview, setPreview] = useState(true)

    return (
        <div className='flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white'>
            {/* Preview Toggle */}
            <button
                onClick={() => {
                    setPreview(!preview)
                }}
                className='absolute right-6 top-6 rounded-xl bg-white/10 px-4 py-2 text-sm transition hover:bg-white/20'
            >
                {preview ? 'Show Code' : 'Show Preview'}
            </button>

            {/* PREVIEW MODE */}
            {preview ? (
                <div className='max-w-md text-center'>
                    <div className='mb-4 text-7xl font-bold'>404</div>

                    <h1 className='mb-2 text-xl font-semibold'>Page not found</h1>

                    <p className='mb-6 text-white/60'>The page you’re looking for doesn’t exist or has been moved.</p>

                    <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
                        <p className='mb-2 text-sm text-white/70'>Need support?</p>
                        <a
                            href='https://t.me/hipo_chat'
                            target='_blank'
                            rel='noreferrer'
                            className='text-sm text-indigo-400 hover:text-indigo-300'
                        >
                            Hipo Chat
                        </a>
                    </div>
                </div>
            ) : (
                /* CODE VIEW */
                <pre className='max-w-2xl overflow-auto rounded-2xl border border-white/10 bg-white/5 p-6 text-xs text-white/60'>
                    {`404 PAGE - HIPO

- Centered layout
- Minimal dark UI
- Large "404" title
- Short explanation
- Support link to community

Support:
Hipo Chat -> https://t.me/hipo_chat`}
                </pre>
            )}
        </div>
    )
}
