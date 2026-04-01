// helpers/boardHelpers.ts
import axios from 'axios';
import { getUserData, getUserIdFromToken } from './Storage';
import toast from 'react-hot-toast';

export const submitBoardForm = async (
  formData: { title: string; image : object },
  setShowModal: (show: boolean) => void,
) => {
  try {
    const user_data = await getUserData();
    const user_id = getUserIdFromToken(user_data?.token as string);
    const create = await axios.post('/Board', {
      title: formData.title,
      image: formData.image,
      data: user_id,
    });
    console.log(create)
    if (create.status === 200) {
      toast.success(create.data.message.message)
    } else {
      toast.error(create.data.message.message)
    }
    setShowModal(false);  // Close modal after submission
  } catch (error: any) {
    console.error('Error creating Board', error.response);
    toast.error(error.response)
  }
};

export const UpdateBoardData = async (
  formdata : {title? : string, image? : object }, 
  board_id : string ) => {
    try {
      const updateData : any = {}
      if(formdata.title) updateData.title = formdata.title
      if(formdata.image) updateData.image = formdata.image
      const response = await axios.patch(`/Board`, {
        title : updateData?.title,
        image : updateData?.image,
        board_id : board_id
      }); 
      if (response.status === 200){
        toast.success(response.data.message)
        return true
      } else {
        toast.error(response.data.message)
        return false
      }
    } catch (error : any) {
      console.error("error in updating Board: ", error)
      toast.error(`Error ${error.data}`)
      return false
    }
}
