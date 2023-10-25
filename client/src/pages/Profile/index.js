import React from "react";
import { Tabs } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import PageTitle from "../../components/PageTitle";
import TheatersList from "./TheatersList";
import Bookings from "./Bookings";

const Profile = () => {
  return (
    <div>
      <PageTitle title="Profile" />
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="Bookings" key="1">
          <Bookings/>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Theaters" key="2">
          <TheatersList/>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default Profile;
