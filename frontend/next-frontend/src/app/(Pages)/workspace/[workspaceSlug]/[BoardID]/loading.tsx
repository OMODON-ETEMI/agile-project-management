import GlobalLoading from "@/src/app/loading";



export default function Loading() {
    return <GlobalLoading/> // You can add props here if needed, e.g., <LoadingSekelton sidebar={true} navbar={true} cards={true} table={true} />
}