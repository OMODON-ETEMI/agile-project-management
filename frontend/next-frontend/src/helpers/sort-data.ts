import { Project, Task } from "./type";

type ProjectsByCategory = {
    [key: string]: (Project | Task) [];
  };
  

export const sortDataByCategory = (data : Project[] | Task[]) => {
    return data.reduce((acc : ProjectsByCategory, item : Project | Task) => {
        const status = item.status
        if (!acc[status]){
            acc[status] = []
        }
        acc[status].push(item)
        return acc
    }, {})
}