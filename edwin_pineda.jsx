import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, GraduationCap, Briefcase, HeartHandshake, Building2, Shield, Languages, Mail, MapPin, ChevronRight } from "lucide-react";

const content = {
  es: {
    nav: {
      about: "Sobre mí",
      journey: "Trayectoria",
      experience: "Experiencia",
      education: "Formación",
      blog: "Blog",
      contact: "Contacto",
    },
    hero: {
      greeting: "Portfolio profesional",
      name: "Edwin Pineda",
      role: "Cloud, Data & Technology Professional",
      subtitle:
        "Una trayectoria internacional construida entre República Dominicana, España y Reino Unido, uniendo tecnología, migración, educación y transformación profesional.",
      primary: "Ver trayectoria",
      secondary: "Cambiar a inglés",
      stat1: "+15 años de experiencia",
      stat2: "España y Reino Unido",
      stat3: "Tecnología, banca, salud y seguros",
      profileLabel: "Imagen de perfil",
      profileHint: "Espacio preparado para añadir la foto de perfil de Edwin Pineda.",
    },
    about: {
      title: "Sobre mí",
      text1:
        "Soy un profesional de origen dominicano con una carrera desarrollada entre España y Reino Unido. Mi historia comienza en Arroyo Dulce, en la provincia de Barahona, y continúa a través de la educación, la migración y el esfuerzo constante hasta participar en proyectos para grandes organizaciones internacionales.",
      text2:
        "Mi perfil combina experiencia en plataformas de datos, bases de datos, cloud, sector público, banca, salud, educación y seguros. También mantengo un fuerte interés por la formación continua, el impacto social y la transmisión de conocimiento.",
      chips: ["República Dominicana", "España", "Reino Unido", "Cloud", "Data", "Sector público", "Salud", "Seguros"],
    },
    journey: {
      title: "Hoja de ruta de vida",
      items: [
        {
          period: "1987 – 2007",
          title: "Raíces y formación inicial en República Dominicana",
          desc: "Infancia y juventud en Arroyo Dulce y Enriquillo. Estudios primarios y secundarios. Inicio de estudios universitarios en la UASD, recinto Barahona. Primera experiencia profesional en Plan International como grabador de datos.",
        },
        {
          period: "2007",
          title: "Migración a España",
          desc: "Llegada a España por reagrupación familiar. Convalidación de estudios y continuidad académica hasta completar un grado universitario en España.",
        },
        {
          period: "Primeros años en España",
          title: "Integración, comunidad y vocación docente",
          desc: "Trabajo como instructor de informática en el Centro Hispano-Dominicano, apoyando la alfabetización digital y la integración laboral de la comunidad migrante.",
        },
        {
          period: "Etapa de crecimiento profesional",
          title: "España: educación, administración pública y grandes corporaciones",
          desc: "Participación en proyectos de tecnología educativa, Ministerio de Asuntos Exteriores, energía, telecomunicaciones, seguros y sanidad privada, colaborando con empresas líderes como HP, IBM, Telefónica e Indra.",
        },
        {
          period: "Reino Unido",
          title: "Internacionalización de la carrera",
          desc: "Desarrollo profesional en el sector asegurador, bancario y sanitario, con experiencia en Websure, TSB Bank, NHS y Synnovis, mientras continúo mi formación en ciberseguridad en The Open University.",
        },
      ],
    },
    experience: {
      title: "Experiencia destacada",
      cards: [
        {
          company: "Centro Hispano-Dominicano",
          type: "Integración social y formación",
          desc: "Impartición de cursos de informática básica y alfabetización digital para apoyar la integración de la comunidad dominicana en España.",
        },
        {
          company: "Educaria / Alexia",
          type: "Tecnología educativa",
          desc: "Participación en soluciones digitales para centros educativos, contribuyendo a la transformación tecnológica del sector académico.",
        },
        {
          company: "HP + Ministerio de Asuntos Exteriores de España",
          type: "Administración pública",
          desc: "Trabajo en sistemas para embajadas y consulados, incluyendo proyectos pioneros de centralización de visados y gestión de información internacional.",
        },
        {
          company: "IBM + CEPSA",
          type: "Energía",
          desc: "Participación en proyectos ligados a digitalización, datos y geolocalización en el sector energético.",
        },
        {
          company: "Telefónica",
          type: "Telecomunicaciones e infraestructuras críticas",
          desc: "Proyectos para grandes organizaciones españolas como Repsol, Ferrovial, Talgo y Quirónsalud, incluyendo migraciones de gran escala hacia centros de datos empresariales.",
        },
        {
          company: "Indra + AXA",
          type: "Tecnología y seguros",
          desc: "Participación en entornos corporativos ligados al sector asegurador y a plataformas de datos empresariales.",
        },
        {
          company: "Websure",
          type: "Sector seguros en Reino Unido",
          desc: "Primera experiencia profesional en Reino Unido, superando la barrera idiomática y demostrando capacidad técnica en arquitectura de sistemas.",
        },
        {
          company: "TSB Bank / Banco Sabadell",
          type: "Banca",
          desc: "Trabajo en plataformas y operaciones tecnológicas para entornos financieros.",
        },
        {
          company: "NHS / Guy’s and St Thomas’ / Synnovis",
          type: "Salud y diagnóstico clínico",
          desc: "Contribución a plataformas y servicios tecnológicos que apoyan operaciones sanitarias y diagnóstico clínico en el Reino Unido.",
        },
      ],
    },
    education: {
      title: "Formación",
      items: [
        "Estudios iniciales en República Dominicana.",
        "Convalidación académica en España y finalización de un grado universitario.",
        "Formación continua orientada a tecnología, datos y sistemas.",
        "Actualmente cursando estudios de ciberseguridad en The Open University, Reino Unido.",
      ],
    },
    blog: {
      title: "Blog / Ideas",
      intro:
        "Este espacio puede utilizarse para publicar artículos personales y profesionales sobre migración, tecnología, superación, educación, cloud, datos y liderazgo.",
      posts: [
        "De Arroyo Dulce a Europa: una historia de migración y tecnología",
        "Cómo la educación transformó mi trayectoria profesional",
        "Del sector público a la salud digital: lecciones de una carrera internacional",
      ],
    },
    contact: {
      title: "Contacto",
      text:
        "Disponible para colaboraciones, networking, charlas, mentoría y oportunidades profesionales internacionales.",
      email: "correo@ejemplo.com",
      location: "Reino Unido / España",
    },
    footer: "Portfolio bilingüe de Edwin Pineda · Español / English",
  },
  en: {
    nav: {
      about: "About",
      journey: "Journey",
      experience: "Experience",
      education: "Education",
      blog: "Blog",
      contact: "Contact",
    },
    hero: {
      greeting: "Professional portfolio",
      name: "Edwin Pineda",
      role: "Cloud, Data & Technology Professional",
      subtitle:
        "An international career shaped across the Dominican Republic, Spain and the United Kingdom, bringing together technology, migration, education and professional transformation.",
      primary: "View journey",
      secondary: "Switch to Spanish",
      stat1: "15+ years of experience",
      stat2: "Spain and the United Kingdom",
      stat3: "Technology, banking, healthcare and insurance",
      profileLabel: "Profile image",
      profileHint: "Reserved area to add Edwin Pineda's profile picture.",
    },
    about: {
      title: "About me",
      text1:
        "I am a Dominican professional with a career developed across Spain and the United Kingdom. My story begins in Arroyo Dulce, in the province of Barahona, and continues through education, migration and sustained effort into projects for major international organizations.",
      text2:
        "My profile combines experience in data platforms, databases, cloud, public sector, banking, healthcare, education and insurance. I also maintain a strong commitment to lifelong learning, social impact and knowledge sharing.",
      chips: ["Dominican Republic", "Spain", "United Kingdom", "Cloud", "Data", "Public sector", "Healthcare", "Insurance"],
    },
    journey: {
      title: "Life roadmap",
      items: [
        {
          period: "1987 – 2007",
          title: "Roots and early education in the Dominican Republic",
          desc: "Childhood and youth in Arroyo Dulce and Enriquillo. Primary and secondary education. University studies at UASD Barahona. First professional experience at Plan International as a data entry specialist.",
        },
        {
          period: "2007",
          title: "Migration to Spain",
          desc: "Arrival in Spain through family reunification. Validation of previous studies and academic continuation until completing a university degree in Spain.",
        },
        {
          period: "Early years in Spain",
          title: "Integration, community and teaching vocation",
          desc: "Work as an IT instructor at Centro Hispano-Dominicano, supporting digital literacy and employability within the migrant community.",
        },
        {
          period: "Professional growth stage",
          title: "Spain: education, public administration and major corporations",
          desc: "Participation in educational technology, Ministry of Foreign Affairs, energy, telecommunications, insurance and private healthcare projects with leading organizations such as HP, IBM, Telefónica and Indra.",
        },
        {
          period: "United Kingdom",
          title: "International career expansion",
          desc: "Professional growth in insurance, banking and healthcare, with experience in Websure, TSB Bank, NHS and Synnovis, while continuing cybersecurity studies at The Open University.",
        },
      ],
    },
    experience: {
      title: "Selected experience",
      cards: [
        {
          company: "Centro Hispano-Dominicano",
          type: "Social integration and training",
          desc: "Delivered basic IT and digital literacy courses to support the integration of the Dominican community in Spain.",
        },
        {
          company: "Educaria / Alexia",
          type: "Education technology",
          desc: "Contributed to digital solutions for schools, supporting technology transformation in the academic sector.",
        },
        {
          company: "HP + Spanish Ministry of Foreign Affairs",
          type: "Public administration",
          desc: "Worked on systems for embassies and consulates, including pioneering visa centralization and international information management initiatives.",
        },
        {
          company: "IBM + CEPSA",
          type: "Energy",
          desc: "Contributed to digitalization, data and geolocation projects in the energy sector.",
        },
        {
          company: "Telefónica",
          type: "Telecommunications and critical infrastructure",
          desc: "Projects for major Spanish organizations such as Repsol, Ferrovial, Talgo and Quirónsalud, including large-scale migrations into enterprise data centers.",
        },
        {
          company: "Indra + AXA",
          type: "Technology and insurance",
          desc: "Worked in corporate environments linked to insurance and enterprise data platforms.",
        },
        {
          company: "Websure",
          type: "Insurance sector in the UK",
          desc: "First professional role in the United Kingdom, overcoming language barriers and demonstrating technical capability through systems architecture.",
        },
        {
          company: "TSB Bank / Banco Sabadell",
          type: "Banking",
          desc: "Worked on platforms and technology operations for financial environments.",
        },
        {
          company: "NHS / Guy’s and St Thomas’ / Synnovis",
          type: "Healthcare and clinical diagnostics",
          desc: "Contributed to technology platforms and services supporting healthcare operations and clinical diagnostics in the United Kingdom.",
        },
      ],
    },
    education: {
      title: "Education",
      items: [
        "Early education in the Dominican Republic.",
        "Academic validation in Spain and completion of a university degree.",
        "Continuous training focused on technology, data and systems.",
        "Currently studying cybersecurity at The Open University, United Kingdom.",
      ],
    },
    blog: {
      title: "Blog / Ideas",
      intro:
        "This section can be used to publish personal and professional articles about migration, technology, resilience, education, cloud, data and leadership.",
      posts: [
        "From Arroyo Dulce to Europe: a story of migration and technology",
        "How education transformed my professional journey",
        "From the public sector to digital health: lessons from an international career",
      ],
    },
    contact: {
      title: "Contact",
      text:
        "Available for collaboration, networking, speaking engagements, mentoring and international professional opportunities.",
      email: "email@example.com",
      location: "United Kingdom / Spain",
    },
    footer: "Edwin Pineda bilingual portfolio · Español / English",
  },
};

function SectionTitle({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 rounded-2xl bg-slate-100 border border-slate-200">
        <Icon className="w-5 h-5 text-slate-700" />
      </div>
      <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">{title}</h2>
    </div>
  );
}

export default function EdwinPinedaPortfolio() {
  const [lang, setLang] = useState("es");
  const t = useMemo(() => content[lang], [lang]);

  const switchLang = () => setLang((prev) => (prev === "es" ? "en" : "es"));

  return (
    <div className="min-h-screen bg-white text-slate-800">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <div className="font-semibold text-slate-900 tracking-tight">Edwin Pineda</div>
            <div className="text-sm text-slate-500">Portfolio</div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="rounded-full border-slate-300 bg-white px-5 py-2.5 shadow-sm hover:bg-slate-50"
              onClick={switchLang}
            >
              <span className="mr-3 text-base">{lang === "es" ? "🇬🇧" : "🇪🇸"}</span>
              <Languages className="w-4 h-4 mr-2" />
              <span className="font-medium">{lang === "es" ? "English" : "Español"}</span>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="max-w-7xl mx-auto px-6 py-20 md:py-28 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge className="rounded-full mb-4 px-4 py-1.5 text-sm bg-slate-100 text-slate-800 hover:bg-slate-100 border border-slate-200 shadow-sm">
              <Globe className="w-4 h-4 mr-2" />
              {t.hero.greeting}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-slate-950 leading-tight">
              {t.hero.name}
            </h1>
            <p className="mt-3 text-xl md:text-2xl text-slate-600">{t.hero.role}</p>
            <p className="mt-6 text-lg text-slate-600 max-w-2xl leading-8">{t.hero.subtitle}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button className="rounded-full px-6 shadow-sm" onClick={() => document.getElementById("journey")?.scrollIntoView({ behavior: "smooth" })}>
                {t.hero.primary}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                className="rounded-full border-slate-300 bg-white px-6 shadow-sm hover:bg-slate-50"
                onClick={switchLang}
              >
                <span className="mr-3 text-base">{lang === "es" ? "🇬🇧" : "🇪🇸"}</span>
                <span className="font-medium">{t.hero.secondary}</span>
              </Button>
            </div>

            <div className="mt-10 grid sm:grid-cols-3 gap-4">
              {[t.hero.stat1, t.hero.stat2, t.hero.stat3].map((item) => (
                <Card key={item} className="rounded-3xl border-slate-200 shadow-sm">
                  <CardContent className="p-5 text-sm text-slate-700 font-medium">{item}</CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <Card className="rounded-[2rem] overflow-hidden border-slate-200 shadow-2xl bg-gradient-to-br from-white to-slate-50">
              <CardContent className="p-8 md:p-10">
                <div className="aspect-[4/5] rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-28 h-28 rounded-full bg-slate-900 text-white flex items-center justify-center text-3xl font-semibold mb-5 shadow-lg">
                    EP
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">{t.hero.profileLabel}</h3>
                  <p className="text-slate-500 mt-2 max-w-sm leading-7">{t.hero.profileHint}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        <section id="about" className="max-w-7xl mx-auto px-6 py-12">
          <SectionTitle icon={HeartHandshake} title={t.about.title} />
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
            <Card className="rounded-3xl border-slate-200 shadow-sm">
              <CardContent className="p-8 space-y-5 text-slate-600 leading-8 text-lg">
                <p>{t.about.text1}</p>
                <p>{t.about.text2}</p>
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-slate-200 shadow-sm">
              <CardContent className="p-8 flex flex-wrap gap-3 content-start">
                {t.about.chips.map((chip) => (
                  <Badge key={chip} variant="secondary" className="rounded-full px-4 py-2 text-sm bg-slate-100 text-slate-700">
                    {chip}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="journey" className="max-w-7xl mx-auto px-6 py-12">
          <SectionTitle icon={MapPin} title={t.journey.title} />
          <div className="space-y-6">
            {t.journey.items.map((item, index) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: index * 0.05 }}>
                <Card className="rounded-3xl border-slate-200 shadow-sm">
                  <CardContent className="p-8 grid md:grid-cols-[220px_1fr] gap-6">
                    <div>
                      <Badge className="rounded-full px-4 py-2 bg-slate-900 text-white hover:bg-slate-900">{item.period}</Badge>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">{item.title}</h3>
                      <p className="mt-3 text-slate-600 leading-8">{item.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="experience" className="max-w-7xl mx-auto px-6 py-12">
          <SectionTitle icon={Briefcase} title={t.experience.title} />
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {t.experience.cards.map((card, index) => (
              <motion.div key={card.company} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: index * 0.04 }}>
                <Card className="rounded-3xl h-full border-slate-200 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                      <CardTitle className="text-lg leading-7">{card.company}</CardTitle>
                      <Building2 className="w-5 h-5 text-slate-400 shrink-0" />
                    </div>
                    <p className="text-sm text-slate-500">{card.type}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 leading-7">{card.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="education" className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-2 gap-8">
          <div>
            <SectionTitle icon={GraduationCap} title={t.education.title} />
            <Card className="rounded-3xl border-slate-200 shadow-sm">
              <CardContent className="p-8">
                <ul className="space-y-4 text-slate-600 leading-8 list-disc pl-5">
                  {t.education.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
          <div>
            <SectionTitle icon={Shield} title={t.blog.title} />
            <Card className="rounded-3xl border-slate-200 shadow-sm">
              <CardContent className="p-8">
                <p className="text-slate-600 leading-8">{t.blog.intro}</p>
                <div className="mt-6 space-y-4">
                  {t.blog.posts.map((post) => (
                    <div key={post} className="rounded-2xl border border-slate-200 p-4 text-slate-700 font-medium bg-slate-50">
                      {post}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="contact" className="max-w-7xl mx-auto px-6 py-12 pb-20">
          <SectionTitle icon={Mail} title={t.contact.title} />
          <Card className="rounded-[2rem] border-slate-200 shadow-sm">
            <CardContent className="p-8 md:p-10 grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-semibold text-slate-900">Edwin Pineda</h3>
                <p className="mt-4 text-slate-600 leading-8">{t.contact.text}</p>
              </div>
              <div className="space-y-4 text-slate-700">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <span>{t.contact.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-slate-400" />
                  <span>{t.contact.location}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-6 py-8 text-sm text-slate-500 flex items-center justify-between gap-4 flex-wrap">
          <span>{t.footer}</span>
          <span className="flex items-center gap-2"><Globe className="w-4 h-4" /> {lang === "es" ? "Sitio bilingüe" : "Bilingual site"}</span>
        </div>
      </footer>
    </div>
  );
}
