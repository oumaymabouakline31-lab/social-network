export default function ComingSoon({
    icon,
    title,
    description,
}: {
    icon: string;
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-4xl">{icon}</p>
            <h1 className="mt-3 text-xl font-bold text-slate-900">{title}</h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{description}</p>
            <span className="mt-5 inline-block rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-600">
                Bientôt disponible
            </span>
        </div>
    );
}
