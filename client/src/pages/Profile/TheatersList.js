import React, { useEffect, useState } from "react";
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";
import TheaterForm from "./TheaterForm";
import { DeleteTheatre, GetAllTheatresByOwner } from "../../apicalls/theatres";
import { HideLoading, ShowLoading } from "../../redux/loadersSlice";
import { useDispatch, useSelector } from "react-redux";
import { Table, message } from "antd";

const TheatersList = () => {
  const { user } = useSelector((state) => state.users);
  const [showTheaterFormModal, setShowTheaterFormModal] = useState(false);
  const [selectedTheater, setSelectedTheater] = useState(null);
  const [formType, setFormType] = useState("add");
  const [theaters, setTheaters] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getData = async () => {
    try {
      dispatch(ShowLoading());
      const response = await GetAllTheatresByOwner({ owner: user._id });
      if (response.success) {
        setTheaters(response.data);
      } else {
        message.error(response.message);
      }
      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      dispatch(ShowLoading());
      const response = await DeleteTheatre({ theatreId: id });
      if (response.success) {
        message.success(response.message);
        getData();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: "Address",
      dataIndex: "address",
    },
    {
      title: "Phone",
      dataIndex: "phone",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      render: (text, record) => {
        if(text) {
          return 'Approved'
        } else {
          return 'Pending / Blocked'
        }
      }
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (text, record) => {
        return (
          <div className="flex gap-1 items-center">
            <i
              className="ri-delete-bin-line"
              onClick={() => {
                handleDelete(record._id);
              }}
            ></i>
            <i
              className="ri-edit-box-line"
              onClick={() => {
                setFormType("edit");
                setSelectedTheater(record);
                setShowTheaterFormModal(true);
              }}
            ></i>
            {record.isActive && <span className="underline">Shows</span>}
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    getData();
  }, []);

  return (
    <div>
      <div className="flex justify-end mb-1">
        <Button
          variant="outlined"
          title="Add Theatre"
          onClick={() => {
            setFormType("add");
            setShowTheaterFormModal(true);
          }}
        />
      </div>

      <Table columns={columns} dataSource={theaters} />

      {showTheaterFormModal && (
        <TheaterForm
          showTheaterFormModal={showTheaterFormModal}
          setShowTheaterFormModal={setShowTheaterFormModal}
          formType={formType}
          setFormType={setFormType}
          selectedTheater={selectedTheater}
          setSelectedTheater={setSelectedTheater}
          getData={getData}
        />
      )}
    </div>
  );
};

export default TheatersList;
