import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Header from "@/components/sidebar/header";
import { trpc } from "@/trpc/pages";
import { ExcalidrawImportData, importExcalidraw } from "@/lib/excalidraw";
import { SidebarLayout } from "@/components/sidebar/sidebar-layout";
import { Skeleton } from "@/components/ui/skeleton";

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
  const signedUrl = trpc.excalidraw.getSignedUrlDesign.useQuery(
    { id },
    { enabled: false },
  );
  const session = trpc.auth.sessionDetails.useQuery().data || null;
  const [initialExcalidrawData, setInitialExcalidrawData] = useState<
    ExcalidrawImportData | undefined
  >(undefined);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  useEffect(() => {
    signedUrl.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!signedUrl.data) {
      return;
    }
    importExcalidraw(signedUrl.data.elementsUrl, signedUrl.data.filesUrl)
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
      <Header>
        <div className="flex w-full flex-row justify-between items-center">
          <p>Excalidraw Diagram</p>
          <p>End title</p>
        </div>
      </Header>
      {error && <div>{error}</div>}
      {!isLoaded && <Skeleton className="w-full h-full" />}
      {isLoaded && initialExcalidrawData && (
        <ExcalidrawWrapper initialData={initialExcalidrawData} id={id} />
      )}
    </SidebarLayout>
  );
}
