"use client"
import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react'
import { Credential, LoginData, Organisation, User, Workspace } from '../helpers/type';
import { UserData } from './user';
import { useRouter } from 'next/navigation';
import { handleAxiosError, handleAxiosSuccess } from '../helpers/response-handler';
import { LoadingSekeleton } from '../components/ui/skeleton';
import { createClientApi } from '../lib/api/apiClient';


interface AuthContextType {
    currentUser?: User | null;
    initialToken: string | null;
    organisation: Organisation[] | undefined
    workspaces: Workspace[] | undefined
    setWorkspace: (workspace: Workspace[]) => void
    setOrganisation: (organisation: Organisation[]) => void
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    Login: (credential: LoginData) => Promise<string | null>;
    Logout: () => void;
    Signin: (credential: Omit<Credential, 'image' | 'title'>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children, initialToken }: { children: ReactNode; initialToken: string | null }): JSX.Element => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [organisation, setOrganisation] = useState<Organisation[] | undefined>(undefined)
    const [workspaces, setWorkspace] = useState<Workspace[] | undefined>(undefined)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const router = useRouter()

    // Create a stable callback for the API client to handle auth failures
    const handleUnauthorized = () => {
        setCurrentUser(null);
        router.push("/user/signup");
    };

    const api = useMemo(() => createClientApi(initialToken, handleUnauthorized), [initialToken]);

    useEffect(() => {
        const fetchUserData = async (initialToken: string) => {
            setIsLoading(true)
            try {
                const userData: User = await UserData(initialToken);
                setCurrentUser(userData)
            } catch (error) {
                console.error("Error fetching user data with initial token: ", error);
                handleAxiosError(error)
            } finally {
                setIsLoading(false)
            }
        }
        if (initialToken) {
            fetchUserData(initialToken)
        }
    }, [initialToken]);


    // const refreshAuthToken = async (): Promise<string | null> => {
    //     try {
    //         console.log("Attempting to refresh auth token from authentication provider...");
    //         const authToken = (await api.post("/auth/refresh")).data;
    //         const userData: User = await UserData(authToken.token);
    //         setCurrentUser(userData)
    //         return authToken.token;
    //     } catch (error) {
    //         handleAxiosError(error)
    //         router.push("/user/signup");
    //         return null;
    //     }
    // };

    async function Login(credential: LoginData) {
        try {
            const user = (await api.post("/login", credential)).data
            const { token } = user
            const userData: User = await UserData(token);
            setCurrentUser(userData)
            const urlSearchParams = new URLSearchParams(window.location.search);
            const redirectPath = urlSearchParams.get('redirect') || '/organisation';
            router.push(redirectPath);
            handleAxiosSuccess(user.response)
            return token
        } catch (error: any) {
            handleAxiosError(error)
            return null
        }
    }

    async function Logout() {
        try {
            const response = await fetch("/api/logout", {
                method: "POST",
                credentials: "include",
            });
            const data = await response.json();
            setCurrentUser(null)
            handleAxiosSuccess(data)
        } catch (error: any) {
            handleAxiosError(error)
        }
    }

    async function Signin(credential: any) {
        try {
            const user = await api.post("/add/user", credential)
            const { token } = user.data
            const userData: User = await UserData(token);
            setCurrentUser(userData)
            const urlSearchParams = new URLSearchParams(window.location.search);
            const redirectPath = urlSearchParams.get('redirect') || '/organisation';
            router.push(redirectPath);
            handleAxiosSuccess(user.data.response)
            return null
        } catch (error) {
            handleAxiosError(error)
            return null
        }
    }

    return (
        <AuthContext.Provider value={{ currentUser, initialToken, isLoading, setIsLoading, organisation, setOrganisation, workspaces, setWorkspace, Login, Signin, Logout }}>
            {isLoading ? <div><LoadingSekeleton sidebar={true} cards={true} navbar={true} table={true} /></div> : children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const authContext = useContext(AuthContext)
    if (!authContext) {
        throw new Error('useAuth must be used within a AuthProvider')
    }

    return authContext
}