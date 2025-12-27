import axios from "axios";
import { API_BASE_URL, extractBody, getAuthHeader } from "@/lib/api";

const getAxiosErrorMessage = (error, fallback) => {
  const status = error?.response?.status;
  const data = error?.response?.data;
  const messageFromServer = data?.message || data?.error || data?.detail;
  const baseMessage = messageFromServer || error?.message || fallback;
  return status ? `${status}: ${baseMessage}` : baseMessage;
};

const mapUserResponseToPersonalInfo = (user) => {
  const fullName = String(user?.fullName ?? "").trim();
  const parts = fullName ? fullName.split(/\s+/) : [];
  const lastName = parts.length ? parts[parts.length - 1] : "";
  const firstName = parts.length > 1 ? parts.slice(0, -1).join(" ") : "";

  const genderRaw = user?.gender != null ? String(user.gender) : "";
  const gender = genderRaw
    ? genderRaw.toLowerCase() === "male"
      ? "male"
      : genderRaw.toLowerCase() === "female"
        ? "female"
        : "other"
    : "other";

  return {
    uid: user?.userId != null ? String(user.userId) : "",
    userId: user?.userId,
    firstName,
    lastName,
    email: user?.email ?? "",
    phoneNumber: user?.phone ?? "",
    gender,
    dateOfBirth: user?.dateOfBirth ?? "",
    address: "",
    passportNumber: "",
  };
};

const mapPersonalInfoToUserUpdateRequest = (personalInfo) => {
  const fullName = `${personalInfo?.firstName ?? ""} ${personalInfo?.lastName ?? ""}`.trim();
  const genderRaw = personalInfo?.gender != null ? String(personalInfo.gender) : "";
  const gender = genderRaw
    ? genderRaw.toUpperCase() === "MALE" || genderRaw.toLowerCase() === "male"
      ? "Male"
      : genderRaw.toUpperCase() === "FEMALE" || genderRaw.toLowerCase() === "female"
        ? "Female"
        : "Other"
    : undefined;

  const dateOfBirthRaw = personalInfo?.dateOfBirth;
  const dateOfBirth = dateOfBirthRaw
    ? String(dateOfBirthRaw).split("T")[0]
    : undefined;

  return {
    fullName: fullName || undefined,
    email: personalInfo?.email || undefined,
    phone: personalInfo?.phoneNumber || undefined,
    gender,
    dateOfBirth,
  };
};

export const fetchCustomerInfo = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Token không tồn tại. Vui lòng đăng nhập lại.");
    }

    const response = await axios.get(`${API_BASE_URL}/users/myInfo`, {
      headers: getAuthHeader(),
    });
    const body = extractBody(response);
    return mapUserResponseToPersonalInfo(body);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin khách hàng:", error);
    throw new Error(getAxiosErrorMessage(error, "Đã xảy ra lỗi. Vui lòng thử lại."));
  }
};

export const updateCustomerInfo = async (updateData) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Token không tồn tại. Vui lòng đăng nhập lại.");
    }

    const userId = updateData?.userId ?? updateData?.uid;
    if (!userId) {
      throw new Error("Không xác định được userId để cập nhật.");
    }

    const payload = mapPersonalInfoToUserUpdateRequest(updateData);

    const response = await axios.put(`${API_BASE_URL}/users/${userId}`, payload, {
      headers: getAuthHeader(),
    });
    const body = extractBody(response);
    const mapped = mapUserResponseToPersonalInfo(body);
    return {
      ...updateData,
      ...mapped,
      address: updateData?.address ?? mapped.address,
      passportNumber: updateData?.passportNumber ?? mapped.passportNumber,
    };
  } catch (error) {
    console.error("Lỗi khi cập nhật thông tin khách hàng:", error);
    throw new Error(getAxiosErrorMessage(error, "Đã xảy ra lỗi. Vui lòng thử lại."));
  }
};
