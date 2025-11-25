// hooks/useAccountInfo.js
import { useState, useEffect } from "react";
import { fetchCustomerInfo, updateCustomerInfo } from "@/services/customerService";

export function useAccountInfo() {
  const [personalInfo, setPersonalInfo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Mock API for testing - comment out real fetch
    // const loadCustomerInfo = async () => {
    //   try {
    //     const data = await fetchCustomerInfo();
    //     setPersonalInfo(data);
    //   } catch (error) {
    //     setErrorMessage("Không thể tải thông tin cá nhân.");
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // loadCustomerInfo();

    // Mock data for testing
    const mockPersonalInfo = {
      id: "12345",
      name: "Nguyễn Văn A",
      email: "nguyenvana@example.com",
      phone: "0123456789",
      address: "123 Đường ABC, Quận XYZ, TP.HCM",
      gender: "Nam",
      dob: "1990-01-01",
      passport: "P123456789",
      bookingHistory: ["BK001", "BK002", "BK003"],
    };

    setPersonalInfo(mockPersonalInfo);
    setLoading(false);
  }, []);

  const handleUpdate = async (updatedInfo) => {
    try {
      await updateCustomerInfo(updatedInfo);
      setPersonalInfo(updatedInfo);
      setIsEditing(false);
      alert("Thông tin đã được cập nhật thành công!");
    } catch (error) {
      setErrorMessage("Cập nhật thông tin thất bại. Vui lòng thử lại.");
    }
  };

  return {
    personalInfo,
    isEditing,
    loading,
    errorMessage,
    setIsEditing,
    handleUpdate,
    setPersonalInfo,
  };
}
