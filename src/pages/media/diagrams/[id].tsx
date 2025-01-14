import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Header from "@/components/sidebar/header";
import { trpc } from "@/trpc/pages";
import { ExcalidrawImportData, importExcalidraw } from "@/lib/excalidraw";
import { SidebarLayout } from "@/components/sidebar/sidebar-layout";

const ExcalidrawWrapper = dynamic(
  async () => (await import("@/components/ExcalidrawWrapper")).default,
  {
    ssr: false,
  },
);

export async function getServerSideProps(context: { params: { id: string } }) {
  const { id } = context.params;
  return {
    props: {
      id,
    },
  };
}

export default function Page({ id }: { id: string }) {
  const signedUrl = trpc.excalidraw.getSignedUrlDesign.useQuery({ id });
  const session = trpc.auth.sessionDetails.useQuery().data || null;
  const [initialExcalidrawData, setInitialExcalidrawData] = useState<
    ExcalidrawImportData | undefined
  >(undefined);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (!signedUrl.data) {
      return;
    }
    importExcalidraw(signedUrl.data)
      .then((data) => {
        setInitialExcalidrawData(data);
      })
      .catch((error) => {
        setError(`Error importing and updating scene: ${error}`);
      })
      .finally(() => {
        setIsLoaded(true);
      });
  }, [signedUrl.data]);
  return (
    <SidebarLayout session={session}>
      <Header />
      {error && <div>{error}</div>}
      {isLoaded && initialExcalidrawData && (
        <ExcalidrawWrapper initialData={initialExcalidrawData} />
      )}
    </SidebarLayout>
  );
}
