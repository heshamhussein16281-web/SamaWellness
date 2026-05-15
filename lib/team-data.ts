export interface Therapist {
  id: number;
  name: string;
  title: string;
  bio: string;
  specializations: string[];
  image: string; // placeholder — replace with real image paths
}

export const therapists: Therapist[] = [
  {
    id: 1,
    name: "Sama Eissa",
    title: "Founder & Counseling Psychologist",
    image: "/team/sama.jpg",
    bio: "Sama is an Individual and Couple Therapist. She attained her Master's degree in Counseling Psychology from the American University in Cairo (AUC). She has wide experience working with various age groups from adolescence to young adults, adults, and partners. Sama utilizes an eclectic approach tailored to the client's individual needs, drawing on humanistic, person-centered, CBT, REBT, and Gestalt methods.",
    specializations: ["Anxiety", "Personality Disorders", "Low Self-Esteem", "Depression", "Couple Therapy", "Inner Child", "Shadow Work"],
  },
  {
    id: 2,
    name: "Sara El Shakankiri",
    title: "Psychiatric & Counseling Psychologist",
    image: "/team/sara.jpg",
    bio: "Sara graduated from Ain Shams University Faculty of Medicine and completed her Master's in Neuropsychiatry, plus clinical training in psychiatry at the University of Pittsburgh. She practices pharmacotherapy and psychotherapy, adopting a systemic approach that addresses individuals within their family and marital context.",
    specializations: ["Adolescent Psychiatry", "General Adult Psychiatry", "Parental & Family Counseling", "Marriage Counseling", "CBT"],
  },
  {
    id: 3,
    name: "Marina Rowes",
    title: "Counseling Psychologist",
    image: "/team/marina.jpg",
    bio: "Marina is a Trauma-focused Counseling Psychologist holding her Bachelor's and Master's from Mesrpac Denmark School. She works with diverse clients through CBT, Internal Family Systems, DBT, and narrative therapy, also utilizing somatic techniques to help clients release emotions from their bodies.",
    specializations: ["PTSD", "Anxiety", "Depression", "Sexual Abuse", "Personality Disorders", "Eating Disorders", "Psychosomatic"],
  },
  {
    id: 4,
    name: "Alia El Meteni",
    title: "Counseling Psychologist",
    image: "/team/alia.jpg",
    bio: "Alia earned her Bachelor's in Psychology from AUC and her Master's in Counseling Psychology from Webster University (Netherlands), and is currently pursuing her Doctorate (PsyD). She adopts an integrative approach drawing on CBT, DBT, and narrative therapy to help clients reshape thought patterns and build resilience.",
    specializations: ["Adolescents & Adults", "Mood Disorders", "Personality Disorders", "Trauma & Anxiety"],
  },
  {
    id: 5,
    name: "Mohamed Torkey",
    title: "Clinical Psychologist",
    image: "/team/mohamed.jpg",
    bio: "Mohamed is a Clinical Psychologist specializing in trauma, grief and loss, and Borderline Personality Disorder. He works with adults and adolescents using Schema Therapy, CBT, and DBT. He also facilitates group support around grief, loss, and emotional regulation, and has expertise in addiction recovery.",
    specializations: ["Trauma", "Grief & Loss", "Anxiety", "Mood Disorders", "OCD", "Borderline Personality Disorder"],
  },
  {
    id: 6,
    name: "Haidy El Masry",
    title: "Counseling Psychologist",
    image: "/team/haidy.jpg",
    bio: "Haidy is a certified counsellor with a Master's in Psychotherapy from IPSICC and a specialized diploma in counseling for survivors of sexual abuse. She is also a Positive Discipline Parent Educator. Her holistic, integrative approach combines CBT, DBT, psychosomatic, and mindfulness-based methods.",
    specializations: ["Anxiety", "Depression", "Relationship Struggles", "Suicidal or Self-Harming Behavior"],
  },
  {
    id: 7,
    name: "Sandy Magdy",
    title: "Counseling Psychologist",
    image: "/team/sandy.jpg",
    bio: "Sandy is a therapist with a medical background specializing in trauma, complex PTSD, eating disorders, and personality disorders. She combines CBT, DBT, Schema Therapy, and positive psychology, believing that healing happens in connection — when individuals feel deeply seen and accepted without judgment.",
    specializations: ["Complex PTSD", "Eating Disorders", "Anxiety", "Depression", "Borderline Personality Disorder"],
  },
  {
    id: 8,
    name: "Nour Hwaidak",
    title: "Counseling Psychologist",
    image: "/team/nour.jpg",
    bio: "Nour is a Jungian Oriented Psychotherapist with an MA from the University of Cincinnati and a PhD candidate at Pacifica Graduate Institute. She is a Licensed Professional Counselor (LPC) and National Certified Counselor (NCC). She approaches psychotherapy from a psychodynamic, psychoanalytic model, working with the client's unconscious.",
    specializations: ["Complex Trauma", "Social Anxiety", "Generalized Anxiety", "Depression", "Grief", "Self-Image Issues"],
  },
];
