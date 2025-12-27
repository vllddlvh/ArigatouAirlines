// hooks/useAccountInfo.js
import { useState, useEffect } from "react";
import { fetchCustomerInfo, updateCustomerInfo } from "@/services/customerService";
import { toast } from "@/hooks/use-toast";

export function useAccountInfo() {
  const [personalInfo, setPersonalInfo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadCustomerInfo = async () => {
      setLoading(true);
      setErrorMessage("");
      try {
        const data = await fetchCustomerInfo();
        setPersonalInfo(data);
      } catch (error) {
        const message = error?.message || "Không thể tải thông tin cá nhân.";
        setErrorMessage(message);
      } finally {
        setLoading(false);
      }
    };

    loadCustomerInfo();
  }, []);

  const handleUpdate = async (updatedInfo) => {
    try {
      setErrorMessage("");
      const updatedFromApi = await updateCustomerInfo(updatedInfo);
      setPersonalInfo(updatedFromApi);
      setIsEditing(false);
      toast({
        title: "Thành công",
        description: "Thông tin đã được cập nhật.",
      });
    } catch (error) {
      const message = error?.message || "Cập nhật thông tin thất bại. Vui lòng thử lại.";
      setErrorMessage(message);
      toast({
        title: "Cập nhật thất bại",
        description: message,
        variant: "destructive",
      });
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
