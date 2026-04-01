import LoadingSekelton from "@/src/component/skeleton";

export default function Loading() {
    return <LoadingSekelton  navbar={true} cards={true} table={true} /> // You can add props here if needed, e.g., <LoadingSekelton sidebar={true} navbar={true} cards={true} table={true} />
}