export interface Message {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: Date;
  isSpeaking?: boolean;
}

export interface Experience {
  company: string;
  role: string;
  period: string;
  type: string;
  bullets: string[];
}

export interface CertificationGroup {
  category: string;
  skills: string[];
}

export interface CVData {
  name: string;
  title: string;
  phone: string;
  email: string;
  linkedin: string;
  languages: { name: string; level: string }[];
  interests: { name: string; detail: string }[];
  experiences: Experience[];
  certifications: CertificationGroup[];
  education: { degree: string; school: string; period: string; details?: string }[];
  references: { name: string; title: string; company: string }[];
}
