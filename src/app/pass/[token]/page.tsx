import React from "react";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import QRCode from "react-qr-code";
import { format } from "date-fns";
import { Calendar } from "lucide-react";
import Image from "next/image";
import logoImg from "@/assets/images/logo/white_bookr_logo.png";

type PassPageProps = {
  params: Promise<{ token: string }>;
};

export default async function EventPassPage({ params }: PassPageProps) {
  const { token } = await params;

  if (!token) {
    return notFound();
  }

  // 1. Try to find in event_bookings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let ticketData: any = null;
  let isGuestInvite = false;

  const { data: booking } = await supabase
    .from("event_bookings")
    .select(
      `
      id, booking_status, guest_name, ticket_count, qr_code_token, event_id,
      profiles (full_name),
      event_passes (name),
      event_zones (zone_name)
    `,
    )
    .eq("qr_code_token", token)
    .maybeSingle();

  if (booking) {
    ticketData = booking;
  } else {
    // 2. Try to find in event_guest_invites
    const { data: invite } = await supabase
      .from("event_guest_invites")
      .select(
        `
        id, status, guest_name, qr_code_token, event_id
      `,
      )
      .eq("qr_code_token", token)
      .maybeSingle();

    if (invite) {
      ticketData = invite;
      isGuestInvite = true;
    }
  }

  if (!ticketData || !ticketData.event_id) {
    return notFound();
  }

  // 3. Fetch Event Details
  const { data: event } = await supabase
    .from("events")
    .select(`id, title, start_datetime, end_datetime, venue_id, cover_image_url`)
    .eq("id", ticketData.event_id)
    .maybeSingle();

  if (!event) {
    return notFound();
  }

  // Formatting Data
  const attendeeName =
    ticketData.guest_name || (!isGuestInvite && ticketData.profiles?.full_name) || "Guest";

  let ticketType = isGuestInvite ? "Guest Invite" : "General Admission";
  if (!isGuestInvite) {
    const passes = ticketData.event_passes;
    if (passes) {
      const passName = Array.isArray(passes) ? passes[0]?.name : passes.name;
      if (passName) ticketType = passName;
    }

    // If it's still General Admission, try zones
    if (ticketType === "General Admission" && ticketData.event_zones) {
      const zones = ticketData.event_zones;
      const zoneName = Array.isArray(zones) ? zones[0]?.zone_name : zones.zone_name;
      if (zoneName) ticketType = zoneName;
    }
  }

  const status = isGuestInvite ? ticketData.status : ticketData.booking_status;
  const isUsed = status === "completed";

  const eventDate = event.start_datetime
    ? format(new Date(event.start_datetime), "EEEE, MMM do yyyy")
    : "TBA";
  const eventTime = event.start_datetime ? format(new Date(event.start_datetime), "h:mm a") : "TBA";

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans text-gray-800">
      <div className="max-w-sm w-full bg-white rounded-[2rem] overflow-hidden relative shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)]">
        {/* Top Header Logo */}
        <div className="bg-[#63A1FD] pt-4 pb-2 flex justify-center relative z-10 border-b-4 border-[#63A1FD]">
          <Image
            src={logoImg}
            alt="Bookr Logo"
            width={180}
            height={180}
            className="object-contain"
          />
        </div>

        {/* Event Details Section */}
        <div className="px-6 pt-6 pb-4 relative z-10 flex gap-4 items-center">
          {event.cover_image_url ? (
            <Image
              src={event.cover_image_url}
              alt="Event Poster"
              width={100}
              height={120}
              className="rounded-xl object-cover w-[100px] h-[120px] shadow-sm border border-gray-100"
            />
          ) : (
            <div className="w-[100px] h-[120px] bg-gray-50 rounded-xl shadow-sm border border-gray-200 flex items-center justify-center">
              <Calendar size={32} className="text-gray-300" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-tight line-clamp-2">
              {event.title || "Bookr Event"}
            </h1>
            <p className="text-[10px] text-[#63A1FD] font-bold tracking-widest uppercase bg-[#63A1FD]/10 inline-block px-2 py-1 rounded-md mb-2">
              Bookr Exclusive
            </p>
            <div className="flex flex-col text-sm text-gray-500 font-medium space-y-1">
              <span>{eventDate}</span>
              <span>{eventTime}</span>
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="px-6 py-2 flex flex-col items-center relative z-10 bg-white border-t border-gray-50">
          <div className="bg-white p-4 rounded-2xl mb-4 relative shadow-[0_0_20px_rgba(0,0,0,0.06)] border border-gray-100">
            {isUsed && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                <span className="bg-red-600 text-white px-4 py-1.5 rounded-full font-bold uppercase tracking-widest text-sm shadow-sm rotate-[-15deg]">
                  Scanned
                </span>
              </div>
            )}
            <QRCode
              value={token}
              size={200}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              viewBox={`0 0 256 256`}
              fgColor="#000000"
            />
          </div>
          <p className="text-gray-500 text-xs font-medium text-center">
            {isUsed ? "This pass has already been used." : "Present this QR code at the entrance."}
          </p>
          {!isUsed && (
            <div className="mt-2 bg-amber-50 border border-amber-100/50 px-3 py-1.5 rounded-lg flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
              <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest">
                Note: Valid for one scan only
              </p>
            </div>
          )}
        </div>

        {/* Perforated Divider */}
        <div className="relative h-8 flex items-center w-full bg-white">
          <div className="absolute -left-4 w-8 h-8 bg-gray-100 rounded-full shadow-inner border-r border-gray-200/50"></div>
          <div className="flex-1 mx-6 border-t-2 border-dashed border-gray-200"></div>
          <div className="absolute -right-4 w-8 h-8 bg-gray-100 rounded-full shadow-inner border-l border-gray-200/50"></div>
        </div>

        {/* Bottom Details Section (Stub) */}
        <div className="px-6 pt-6 pb-6 bg-gray-50/80">
          <div className="grid grid-cols-2 gap-y-5 gap-x-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">
                Attendee
              </p>
              <p className="font-semibold text-gray-800 text-sm truncate">{attendeeName}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">
                Ticket Type
              </p>
              <p className="font-semibold text-gray-800 text-sm truncate">{ticketType}</p>
            </div>
            {!isGuestInvite && ticketData.ticket_count > 1 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">
                  Admit
                </p>
                <p className="font-semibold text-gray-800 text-sm">
                  {ticketData.ticket_count} People
                </p>
              </div>
            )}
          </div>
          {/* 
          <div className="mt-6 pt-4 border-t border-gray-200/60 text-center">
            <p className="text-gray-400 text-[11px] font-mono uppercase tracking-widest">
              Booking ID: {token.substring(0, 12)}
            </p>
          </div>
          */}
        </div>
      </div>
    </div>
  );
}
