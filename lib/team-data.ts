export interface Therapist {
  id: number;
  name: string;
  title: string;
  approach: string;
  bio: string;
  specializations: string[];
  image: string; // placeholder — replace with real image paths
}

export const therapists: Therapist[] = [
  {
    id: 1,
    name: "Sama Eissa",
    title: "Founder and Clinical Director",
    approach: "Individual, and couple therapist utilizes Eclectic, Client-centered, Gestalt approach. Emphasizing individual autonomy, humanistic values, and person-tailored techniques.",
    image: "/team/sama.jpg",
    bio: "Sama is an Individual and Couple Therapist. She attained her Master's degree in Counseling Psychology from the American University in Cairo (AUC). She has a wide experience in working with various age groups from adolescence to young adults, adults, and partners. Sama practiced and trained at the Psychological Counseling Services and Training Center at AUC. In addition, she is an Enneagram practitioner that provides an accurate description of the core structures of the nine personality types. She conducted several workshops that were aimed to help individuals with anxiety, low self-esteem, and stress management. Sama's approach is tailored around the client. She believes that humans are layered, complex, and unique in their nature like fingerprints. Hence, she doesn't believe in a one size fits all approach that provides all clients with similar techniques. Therefore, Sama utilizes an eclectic approach that is tailored to the client's individual needs. Sama believes in respecting and honoring the clients' sense of autonomy in helping them get more of what they want, and less of what they do not want, as long as it is not destructive to them or to others through a humanistic and person-centered approach, cognitive behavioral therapy, rational emotive behavior therapy, and Gestalt. Her philosophy is to help clients minimize their suffering and maximize their freedom in ways that they are not destructive to themselves or others. Sama's greatest aspiration is to be an instrument to serve others and to be of use to other humans.",
    specializations: ["Anxiety", "Personality Disorders", "Low Self-Esteem", "Depression", "Couple Therapy", "Gestalt", "Inner Child", "Shadow Work"],
  },
  {
    id: 2,
    name: "Sara El Shakankiri",
    title: "Psychiatric & Counseling Psychologist",
    approach: "Systemic approach addressing individuals within family and marital context, emphasizing harmony between biological science and human experience.",
    image: "/team/sara.jpg",
    bio: "Sarah Elshakankiry graduated from the faculty of medicine, Ain Shams University in 2003. She completed her Master's degree in Neuropsychiatry from Ain Shams University; as well as, completing her clinical training in psychiatry at the University of Pittsburgh in the USA. In addition, Sara is practicing pharmacotherapy and psychotherapy. She always had a special interest in the complexity of the human brain. She was keen to pursue a career in discovering and understanding the interplay between our thoughts, emotions, and behaviors. Her philosophy is built on the belief that mental health requires a harmony between biological science and the human experience. She adopts a systemic approach, addressing individuals within their family and marital context to help patients of all ages move beyond symptoms and build lasting resilience.",
    specializations: ["Adolescent Psychiatry", "General Adult Psychiatry", "Parental & Family Counseling", "Marriage Counseling", "CBT"],
  },
  {
    id: 3,
    name: "Marina Rowes",
    title: "Counseling Psychologist",
    approach: "Trauma-focused approach using somatic techniques and internal family systems to help clients reconnect with their authentic selves and inner truth.",
    image: "/team/marina.jpg",
    bio: "Marina is a Trauma-focused Counseling Psychologist, holding her Bachelor's and Master's degree in Counseling Psychology from Mesrpac Denmark school in Denmark. She has expertise with clients suffering from abuse. She worked with a diverse base of clients across culture through cognitive behavioral therapy, internal family system, dialectical behavior therapy, internal family system, and narrative therapy. Marina also utilizes somatic techniques to help clients who need to release emotions from their bodies. Marina's work is guided by her compassion and accountability, with the aim of creating a safe and empowering space for her clients. Her philosophy centers on empowering individuals to reconnect with their authentic selves and embrace their truth. Her approach fosters self-awareness, inner alignment, and emotional ease.",
    specializations: ["PTSD", "Anxiety", "Depression", "Sexual Abuse", "Personality Disorders", "Eating Disorders", "Psychosomatic"],
  },
  {
    id: 4,
    name: "Alia El Meteni",
    title: "Counseling Psychologist",
    approach: "Integrative approach combining CBT, DBT, and narrative therapy to help clients reshape thought patterns, regulate emotions, and build resilience.",
    image: "/team/alia.jpg",
    bio: "Alia El Meteni is a counseling psychologist who earned her Bachelor's degree in Psychology from The American University in Cairo and her Master's degree in Counseling Psychology from Webster University in the Netherlands. She is currently pursuing her Doctorate in Psychology (PsyD). Alia began her clinical journey at Behman Psychiatric Hospital, where she trained and worked with both inpatients and outpatients experiencing a range of conditions. She has also provided counseling services in the Netherlands, supporting clients with mood disorders, personality disorders, and trauma-related concerns. Alia adopts an integrative therapeutic approach, drawing on evidence-based modalities such as; cognitive behavioral therapy, dialectical behavior therapy, and narrative therapy. She works collaboratively with clients to help them understand and reshape thought patterns, regulate emotions, build effective coping strategies, and navigate life's challenges with greater resilience. Her philosophy is that she believes that while we cannot control every aspect of our lives, we can learn to better interpret and respond to our experiences.",
    specializations: ["Adolescents & Adults", "Mood Disorders", "Personality Disorders", "Trauma & Anxiety"],
  },
  {
    id: 5,
    name: "Mohamed Torkey",
    title: "Clinical Psychologist",
    approach: "Trauma-informed approach using schema therapy, CBT, and DBT, prioritizing the therapeutic relationship and safety for meaningful change.",
    image: "/team/mohamed.jpg",
    bio: "Mohamed is a Clinical Psychologist he mainly work with trauma, grief and loss, and Borderline Personality Disorder. Mohamed worked with adults and adolescents, helping them deal with difficult emotions and overwhelming life experiences while building a better understanding of themselves. Mohamed uses different approaches depending on what fits each person best, including Schema Therapy, cognitive behavioral therapy, dialectical behavior therapy. Mohamed also works with anxiety, mood disorders, OCD, and personality-related difficulties, with a focus on understanding patterns and gradually working to change them in a realistic way. Mohamed utilizes group therapy as well, focusing on facilitating support groups around grief, loss, and emotional regulation. Mohamed has expertise in addiction recovery, and helping clients stay consistent and build more stable routines. Mohamed believes the most important part of therapy is the relationship. He tries to create a space where people feel safe, understood, and not judged. From there, we can start making sense of things and work toward a life that feels more balanced and manageable. His philosophy is that trauma, despite its intensity, can become an opportunity for growth and positive change when approached in a healthy way. He strive to help clients deepen their self-awareness and discover meaning in their experiences.",
    specializations: ["Trauma", "Grief & Loss", "Anxiety", "Mood Disorders", "OCD", "Borderline Personality Disorder"],
  },
  {
    id: 6,
    name: "Haidy El Masry",
    title: "Counseling Psychologist",
    approach: "Holistic, integrative approach combining CBT, DBT, and mindfulness to address emotional, psychological, relational, and physical well-being.",
    image: "/team/haidy.jpg",
    bio: "Haidy is a certified counsellor with a master's degree in Psychotherapy from IPSICC; as well as a specialized diploma and bachelor's degree in Counselling for survivors of sexual abuse. She is also certified as a positive discipline parent educator by the American PDA. Haidy started her counselling career in 2011, and started using her social media platforms to raise the community awareness. Through her work, she equips parents and caregivers with the knowledge and tools needed to raise healthy, well-adjusted children. Haidy believes that changing our parenting daily struggles is real and building a healthy character in our children is a journey full with awareness. Haidy has supported clients struggling with anxiety, depression, relationship issues, low self-esteem, as well as suicidal or self-harming behaviors. In her practice, she uses an integrative approach, and personalized treatment plans through cognitive behavioral therapy, dialectical behavior therapy, psychosomatic, and mindfulness-based approaches, to meet the diverse needs, backgrounds, personalities, and goals of the clients she serves. Her philosophy is rooted in a holistic approach to psychotherapy, recognizing the deep connection between emotional, psychological, relational, and physical experiences. She believes that a safe, supportive, and trusting therapeutic relationship is essential for meaningful growth. Through this process, individuals can develop greater self-awareness, strengthen resilience, and create lasting, meaningful change.",
    specializations: ["Anxiety", "Depression", "Relationship Struggles", "Suicidal or Self-Harming Behavior"],
  },
  {
    id: 7,
    name: "Sandy Magdy",
    title: "Counseling Psychologist",
    approach: "Compassionate, integrative approach combining CBT, DBT, schema therapy, and positive psychology to support healing and lasting change.",
    image: "/team/sandy.jpg",
    bio: "Sandy Magdy is a therapist with a medical background, specializing in trauma, complex PTSD, eating disorders, anxiety, depression, and personality disorders, including borderline personality disorder. She works through a deeply compassionate and integrative approach, combining cognitive behavioral therapy, dialectical behavior therapy, schema therapy, and positive psychology to support clients in healing at the root level, building emotional resilience, and creating meaningful, lasting change. Her philosophy is that healing happens in connection—when individuals feel deeply seen, understood, and accepted without judgment. She believes that every behavior, no matter how painful or confusing, carries a story that deserves to be met with compassion and curiosity. Her work is grounded in creating a safe, supportive space where clients can reconnect with their authentic selves, feel empowered, and move toward a more fulfilling life aligned with their highest potential.",
    specializations: ["Complex PTSD", "Eating Disorders", "Anxiety", "Depression", "Borderline Personality Disorder"],
  },
];
