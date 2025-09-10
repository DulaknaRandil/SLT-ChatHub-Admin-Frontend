import React from 'react';
import Head from 'next/head';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </Head>
      <main>{children}</main>
      {/* Bootstrap bundle script will be loaded by Next when required in production; keep pages lightweight */}
    </>
  );
}
