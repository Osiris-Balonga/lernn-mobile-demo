export const TEACHER_PHOTO_URLS = {
  "Alain Boukaka": "/teacher-photos/alain-boukaka.jpg",
  "Armand Bakala": "/teacher-photos/armand-bakala.jpg",
  "Cédric Mouanda": "/teacher-photos/cedric-mouanda.jpg",
  "Chantal Nkoua": "/teacher-photos/chantal-nkoua.jpg",
  "Estelle Ngoma": "/teacher-photos/estelle-ngoma.jpg",
  "Esther Mavoungou": "/teacher-photos/esther-mavoungou.jpg",
  "Grace Mayembo": "/teacher-photos/grace-mayembo.jpg",
  "Junior Mpassi": "/teacher-photos/junior-mpassi.jpg",
  "Lucien Moukoko": "/teacher-photos/lucien-moukoko.jpg",
  "Marie Okemba": "/teacher-photos/marie-okemba.jpg",
  "Nadine Mvouama": "/teacher-photos/nadine-mvouama.jpg",
  "Patrick Loufoua": "/teacher-photos/patrick-loufoua.jpg",
  "Pauline Kodia": "/teacher-photos/pauline-kodia.jpg",
  "Serge Kimbembe": "/teacher-photos/serge-kimbembe.jpg",
} as const

export type DemoTeacherName = keyof typeof TEACHER_PHOTO_URLS

export function getTeacherPhotoUrl(teacherName: string): string | null {
  return TEACHER_PHOTO_URLS[teacherName as DemoTeacherName] ?? null
}
