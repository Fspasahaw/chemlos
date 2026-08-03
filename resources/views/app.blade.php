<!DOCTYPE html>
<html lang="id" data-user-theme="{{ auth()->check() ? auth()->user()->tema_preferensi : '' }}" data-user-lang="{{ auth()->check() ? auth()->user()->bahasa_preferensi : '' }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title inertia>{{ config('app.name', 'ChemLOS') }}</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    <script>
        (function () {
            // Theme: cegah FOUC dengan menerapkan class dark sebelum hydration.
            const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const userTheme = document.documentElement.dataset.userTheme;
            let theme = localStorage.getItem('theme');
            if (!theme || theme === 'null') {
                theme = userTheme === 'dark' || userTheme === 'light' || userTheme === 'system' ? userTheme : 'system';
            }
            if (theme === 'dark' || (theme === 'system' && systemDark)) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }

            // Language: sinkronkan attribute lang sebelum hydration.
            const userLang = document.documentElement.dataset.userLang;
            const storedLang = localStorage.getItem('lang');
            const lang = storedLang || userLang || 'id';
            if (lang === 'id' || lang === 'en') {
                document.documentElement.lang = lang;
            }
        })();
    </script>

    @viteReactRefresh
    @vite('resources/js/app.tsx')
    @inertiaHead
</head>
<body class="font-sans antialiased bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    @inertia
</body>
</html>
