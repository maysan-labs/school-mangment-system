"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type DocType = 
  | 'birth_certificate' 
  | 'previous_marksheet' 
  | 'transfer_certificate'
  | 'student_photo'
  | 'father_photo'
  | 'mother_photo';

export interface StudentDocument {
  id?: string;
  student_id: string;
  doc_type: string;
  file_url?: string | null;
  is_verified?: boolean;
  uploaded_at?: string;
}

const DOC_TYPE_LABELS: Record<DocType, string> = {
  birth_certificate: "Birth Certificate",
  previous_marksheet: "Previous Marksheet",
  transfer_certificate: "Transfer Certificate (TC)",
  student_photo: "Student Photo",
  father_photo: "Father Photo",
  mother_photo: "Mother Photo",
};

function getDocTypeLabel(docType: string): string {
  return DOC_TYPE_LABELS[docType as DocType] || docType;
}

export async function getStudentDocuments(studentId: string): Promise<{ success: boolean; data?: StudentDocument[]; error?: string }> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("student_documents")
    .select("*")
    .eq("student_id", studentId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data || [] };
}

export async function getAllStudentsWithDocuments(): Promise<{ success: boolean; data?: any[]; error?: string }> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("students")
    .select(`
      id,
      admission_number,
      profile:profiles(full_name),
      class:classes(name),
      documents:student_documents(doc_type, file_url, is_verified, uploaded_at)
    `)
    .order("admission_number", { ascending: true });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data || [] };
}

export async function saveDocumentUrl(
  studentId: string, 
  docType: DocType, 
  fileUrl: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("student_documents")
    .upsert({
      student_id: studentId,
      doc_type: docType,
      file_url: fileUrl,
      is_verified: false,
      uploaded_at: new Date().toISOString(),
    }, {
      onConflict: 'student_id,doc_type'
    });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteDocument(
  studentId: string, 
  docType: DocType
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("student_documents")
    .delete()
    .match({ student_id: studentId, doc_type: docType });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function verifyDocument(
  studentId: string, 
  docType: DocType,
  verified: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("student_documents")
    .update({ is_verified: verified })
    .match({ student_id: studentId, doc_type: docType });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}