import { LoadingSekeleton } from "@/src/components/ui/skeleton";


export default function Loading() {
    return <LoadingSekeleton sidebar={true} navbar={true} cards={true} table={true} /> // You can add props here if needed, e.g., <LoadingSekelton sidebar={true} navbar={true} cards={true} table={true} />
}