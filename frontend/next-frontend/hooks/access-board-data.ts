import { UserResponse } from "@/src/helpers/type";
import axios from "axios";
import { useEffect, useState } from "react";

const accessUserData = (boardId : string | string[] | undefined) => {
    const [loading, setLoading] = useState<boolean>(true)
    const [data, setData] = useState<UserResponse | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {

        if (!boardId || Array.isArray(boardId)) return;
        const fetchBoard = async () => {
            setLoading(true)
            try{
                const response = await axios.get<UserResponse>(`http://localhost:5000/board/${boardId}/user_access`)
                setData(response.data)
            } catch (err: any) {
                setError(err.response ? err.response.data : err.message);
            } finally{
                setLoading(false)
            }
        }

        fetchBoard()
    },[boardId])

    return { data, loading, error};
}

export default accessUserData;