import { listContacts } from "@/lib/contacts";
import { ContactList } from "@/components/admin/ContactList";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const { contacts, source } = await listContacts();
  const newCount = contacts.filter((c) => c.status === "new").length;

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 md:px-10 md:py-14">
      <header>
        <p className="eyebrow text-gold-500">Formulaire de contact</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.03em] text-snow md:text-4xl">
          Messages
        </h1>
        <p className="mt-2 text-[0.9375rem] text-ice-300/55">
          {newCount > 0
            ? `${newCount} message${newCount > 1 ? "s" : ""} non lu${newCount > 1 ? "s" : ""}.`
            : "Tous les messages sont traités."}
          {source === "local" && " · Lecture depuis le fichier local."}
        </p>
      </header>

      <ContactList contacts={contacts} />
    </div>
  );
}
