// import jwt from 'jsonwebtoken';
// import { User } from './type';
// import { handleAxiosError } from './response-handler';

// export const getSecretKey = () => {
//   return process.env.JWT_SECRET_KEY;
// };
// // Function to retrieve user ID from JWT token
// // Function to retrieve user ID from JWT token
// export const getUserIdFromToken = (token: string): string | null => {
//   try {
//       const decodedToken = jwt.decode(token) as {'user_id': string};
//       return decodedToken.user_id;
//   } catch (error) {
//       console.error('Error decoding JWT token:', error);
//       return null;
//   }
// };


// export const getUserDataFromCookie = (Cookie: string)=> {
//   try {
//       const decodedToken = jwt.decode(Cookie);
//       const data = decodedToken as User
//       return data;
//   } catch (error) {
//       handleAxiosError(error)
//   }
// };

// // Function to store user data in local storage
// export const storeUserData = (token: string): void => {
//         if (typeof window !== 'undefined') {
//             sessionStorage.setItem('user', token);
//             console.log("Data successfully stored")
//         } else {
//             console.error("Data not Succesfully saved.")
//         }
// };

// // Function to retrieve user data from local storage
// export const getUserData = async () => {
//   if (typeof window === 'undefined') {
//     throw new Error('Window object is not defined');
//   }

//   const token = sessionStorage.getItem('user');
//   if (!token) {
//     throw new Error('No token found in storage');
//   }

//   try {
//     const decodedToken = jwt.decode(token);
//     if (!decodedToken) {
//       throw new Error('Decoded token is null or empty');
//     }
//     return { decodedToken, token };
//   } catch (error: any) {
//     throw new Error(`Error decoding token: ${error.message}`);
//   }
// };

// export const getBoardData = (): any[] | null => {
//     if (typeof window !== 'undefined') {
//         const boardDataString = sessionStorage.getItem('Boards');
//         console.log("Boards data",boardDataString)
//         return boardDataString ? JSON.parse(boardDataString) : null;
//     }
//     console.log('Return Null')
//     return null;
// };
