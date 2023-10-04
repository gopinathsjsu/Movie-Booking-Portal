import React, { useEffect, useState } from 'react'
import { GetCurrentUser } from '../apicalls/users'
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { SetUser } from '../redux/usersSlice';
import { HideLoading, ShowLoading } from '../redux/loadersSlice';

const ProtectedRoute = ({children}) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {user} = useSelector((state) => state.users)

    const getCurrentUser = async () => {
        try {
            dispatch(ShowLoading())
            const response = await GetCurrentUser();
            dispatch(HideLoading())
            if(response.success) {
                dispatch(SetUser(response.data));
            }else {
                dispatch(SetUser(null));
                message.error(response.message);
            }
        } catch (error) {
            dispatch(HideLoading())
            dispatch(SetUser(null));
            message.error(error.message);
        }
    }

    useEffect(() => {
        if(localStorage.getItem('token')){
            getCurrentUser();
        } else {
            navigate('/login');
        }
        
    }, [])
    console.log(user)
  return (
    user && (<div>
        {children}
    </div>)
  )
}

export default ProtectedRoute