import React, { createContext, useContext, useState } from "react";

export interface ProfileData {
  name: string;
  email: string;
  phone: string;
  countryCode: string;
  dob: string;
  gender: string;
  avatar: any;
}

interface ProfileContextType {
  profile: ProfileData;
  updateProfile: (updated: Partial<ProfileData>) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<ProfileData>({
    name: "Jennifer Aaker",
    email: "example@gmail.com",
    phone: "(208) 555-0112",
    countryCode: "+1",
    dob: "15/02/2002",
    gender: "Female",
    avatar: require("../../assets/images/fashion_portrait_2_1781014083606.png"),
  });

  const updateProfile = (updated: Partial<ProfileData>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
  };

  return (
    <ProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
