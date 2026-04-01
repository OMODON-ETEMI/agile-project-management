import dotenv from 'dotenv';
import axios from "axios";
import { Board, Issue, Project, User } from "./type";
import toast from "react-hot-toast";
import { handleAxiosError, handleAxiosSuccess } from "./response-handler";
import { useAuth } from "../Authentication/authcontext";
import api from "../lib/api";



dotenv.config();


// need to cache this guy
export const getUserBoards = async (user_id: string | undefined):Promise<Board[]> => {
    try {
      const response = await api.get('/board/user_id', {
        headers: {'X-User-ID': user_id}
      })
      const data : Board[] = response.data || []
        return data
    } catch (error: any) {
      return handleAxiosError(error)
    }
  };
  
  export const getAccessUserBoard = async ( board_id: string):Promise<User[]> => {
    try {
      const response = await api.get(`/board/${board_id}/user_access`)
      const data : User[] = response.data.user
      return data
    } catch (error: any) {
      return handleAxiosError(error)
    }
  };



  // export const UpdateBoardSessionStorage = async () => {
  //   try {
  //     const boards : Board [] = await getUserClientBoards(sessionStorage.getItem('user') as string)
  //     if(boards) {
  //       sessionStorage.setItem('Boards', JSON.stringify(boards))
  //       return true
  //     } else {
  //       return false
  //     }
  //   } catch (error: any) {
  //     return handleAxiosError(error)
  //   }
  // }

  export const DeleteBoard = async (board_id : string) => {
    try {
      const { currentUser } = useAuth()
      const user_id = currentUser?.user_id
      const response = await api.delete(`/board/${board_id}/delete`, {params: user_id})
      return response
    } catch (error : any) {
      console.error(error)
      toast.error(`Error: ${error.message}`);
      return error.data
    }
  }


  export const GetProjects = async ( board_id: string) => {
    try {
      const response = (await axios('http://localhost:4000/project/search', { params : {board_id} })).data
      const data : Project[] = response.data
      return data
    } catch (error: any) {
      return handleAxiosError(error)
    }
  }

  export const CreateProjects = async (create: object) => {
    try {
      const response = (await axios.post('http://localhost:4000/project/create', create)).data;
      const data : Project = response.data;
      handleAxiosSuccess(response.message)
      return data;
    } catch (error: any) {
      return handleAxiosError(error)
    }
  }

  export const UpdateProjects = async (update: object) => {
    try {
      console.log('update Project: ', update)
      const response = (await axios.patch('http://localhost:4000/project/update', update)).data
        const data : Project = response.data;
        handleAxiosSuccess(response.message)
        return data;  
    } catch (error: any) {
      return handleAxiosError(error)
    }
  }

  export const DeleteProject = async (Delete: object) => {
    try {
      const response = await axios.delete('http://localhost:4000/project/delete', {data: Delete});
      if(response.status === 200) {
        const onSuccess = {
          data  : response.data.deletedproject,
        } 
        toast.success(`Project ${response.data.deletedproject.name} Deleted`)
        return onSuccess;  
      }
      return toast.error(`Backend error: ${response.data.Error}`)
    } catch (error: any) {
      return handleAxiosError(error)
    }
  }

  export const CreateTask = async (create: object) => {
    try {
      const response = await axios.post('http://localhost:4000/task/create', create);
      const data : Issue = response.data;
      return data;
    } catch (error: any) {
      return handleAxiosError(error)
    }
  }


//   export const GetUserFromProject = async (cookie : string, user_id: string) => {
//     try {
// // Not used yet
//       const response = await axios('http://localhost:4000/project/search', { params : {user_id}, headers : { 'cookie' : `User_Cookie=${cookie}` } })
//       const data : Project[] = response.data
//       return data
//     } catch (error: any) {
//       return handleAxiosError(error)
//     }
//   }


  export const GetIssue = async (params: object) => {
      try{
        const project = await axios.get('http://localhost:4000/project/search', {params})
        if (project.data) {
          const projectData : Project = project.data[0]
          return projectData
        } 
      } catch (error : any) {
        return handleAxiosError(error)
      }

      try {
        const issue = await axios.get('http://localhost:4000/task/search', {params})
        if (issue.data) {
          const issueData : Issue = issue.data[0]
          return issueData
        }
      } catch (error: any) {
        return handleAxiosError(error)
      }
  }