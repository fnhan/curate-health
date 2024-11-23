import Link from "next/link";

import { Button } from "components/ui/button";

export default function BookAppointment() {
  return (
    <Link href={"/booking"}>
      <Button className="rounded-none border border-white bg-transparent px-8 py-8 text-xl text-white transition-all duration-300 hover:bg-white hover:text-primary hover:text-white">
        Book Appointment
      </Button>
    </Link>
  );
}
