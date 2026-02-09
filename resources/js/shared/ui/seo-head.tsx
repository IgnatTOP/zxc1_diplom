import { Head } from '@inertiajs/react';

type SeoMeta = {
    title?: string;
    description?: string;
    canonical?: string;
};

type Props = {
    meta?: SeoMeta;
};

export function SeoHead({ meta }: Props) {
    const title = meta?.title ?? 'DanceWave';
    const description =
        meta?.description ??
        'DanceWave — современная танцевальная студия. Расписание, цены, направления и личный кабинет.';
    const canonical = meta?.canonical;

    const schema = {
        '@context': 'https://schema.org',
        '@type': 'DanceSchool',
        name: 'DanceWave',
        description,
        url: canonical,
        priceRange: '900-6900 RUB',
        address: {
            '@type': 'PostalAddress',
            addressCountry: 'RU',
        },
    };

    return (
        <Head title={title}>
            <meta name="description" content={description} />
            <meta
                name="keywords"
                content="танцы, dancewave, студия танцев, hip-hop, contemporary, latin"
            />
            <meta name="robots" content="index,follow" />
            {canonical ? <link rel="canonical" href={canonical} /> : null}

            <meta property="og:type" content="website" />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            {canonical ? <meta property="og:url" content={canonical} /> : null}
            <meta property="og:site_name" content="DanceWave" />
            <meta property="og:locale" content="ru_RU" />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />

            <script type="application/ld+json">{JSON.stringify(schema)}</script>
        </Head>
    );
}
