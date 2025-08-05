"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { PortableText } from "next-sanity";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { getTeamMemberUrlId } from "@/lib/utils";

interface TeamMember {
    name?: string | null;
    role?: Array<
        | {
            children?: Array<{
                marks?: Array<string>;
                text?: string;
                _type: "span";
                _key: string;
            }>;
            style?: "normal" | "h1" | "h2" | "h3" | "h4" | "blockquote";
            listItem?: "bullet" | "number";
            markDefs?: Array<{
                href?: string;
                _type: "link";
                _key: string;
            }>;
            level?: number;
            _type: "block";
            _key: string;
        }
        | {
            asset?: {
                _ref: string;
                _type: "reference";
                _weak?: boolean;
            };
            hotspot?: any;
            crop?: any;
            alt?: string;
            _type: "image";
            _key: string;
        }
    > | null;
    bio?: Array<
        | {
            children?: Array<{
                marks?: Array<string>;
                text?: string;
                _type: "span";
                _key: string;
            }>;
            style?: "normal" | "h1" | "h2" | "h3" | "h4" | "blockquote";
            listItem?: "bullet" | "number";
            markDefs?: Array<{
                href?: string;
                _type: "link";
                _key: string;
            }>;
            level?: number;
            _type: "block";
            _key: string;
        }
        | {
            asset?: {
                _ref: string;
                _type: "reference";
                _weak?: boolean;
            };
            hotspot?: any;
            crop?: any;
            alt?: string;
            _type: "image";
            _key: string;
        }
    > | null;
    image?: {
        asset?: {
            url?: string | null;
        } | null;
    } | null;
}

interface TeamMembersSectionProps {
    teamMembers: TeamMember[];
}

export default function TeamMembersSection({ teamMembers }: TeamMembersSectionProps) {
    const searchParams = useSearchParams();
    const [openAccordion, setOpenAccordion] = useState<string | undefined>();
    const teamMemberRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    useEffect(() => {
        const memberParam = searchParams.get('member');
        if (memberParam && teamMembers) {
            // Find the team member by name (case-insensitive)
            const targetMember = teamMembers.find(
                member => getTeamMemberUrlId(member.name || '') === memberParam.toLowerCase()
            );

            if (targetMember) {
                const memberId = `member-${getTeamMemberUrlId(targetMember.name || '')}`;
                setOpenAccordion(memberId);

                // Scroll to the team member after a short delay to ensure rendering
                setTimeout(() => {
                    const element = teamMemberRefs.current[memberId];
                    if (element) {
                        element.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        });
                    }
                }, 100);
            }
        }
    }, [searchParams, teamMembers]);

    return (
        <section className="bg-white text-primary">
            <div className="container grid grid-cols-1 gap-4 py-20 md:grid-cols-2 lg:grid-cols-3 items-start">
                {teamMembers?.map((teamMember) => {
                    const memberId = `member-${getTeamMemberUrlId(teamMember.name || '')}`;

                    return (
                        <Card
                            key={teamMember.name}
                            className="flex flex-col rounded-none h-full"
                            ref={(el) => {
                                teamMemberRefs.current[memberId] = el;
                            }}
                        >
                            <div className="h-[300px]">
                                <Image
                                    className="h-full w-full object-cover"
                                    src={teamMember.image?.asset?.url ?? ""}
                                    alt={teamMember.name ?? ""}
                                    width={400}
                                    height={400}
                                />
                            </div>
                            <CardHeader className="flex-1">
                                <CardTitle className="font-light not-italic">
                                    {teamMember.name}
                                </CardTitle>
                                <CardDescription>
                                    <div className="prose text-sm [&_li]:my-0 [&_li]:p-0 [&_ul]:m-0 [&_ul]:list-none [&_ul]:p-0">
                                        <PortableText value={teamMember.role!} />
                                    </div>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="relative">
                                <Accordion
                                    type="single"
                                    collapsible
                                    value={openAccordion === memberId ? memberId : undefined}
                                    onValueChange={(value) => setOpenAccordion(value)}
                                >
                                    <AccordionItem value={memberId} className="border-none">
                                        <AccordionTrigger>Learn More</AccordionTrigger>
                                        <AccordionContent className="absolute top-12 -left-[1px] -right-[1px] z-10 bg-white border-l border-r border-b border-border p-4 mt-2">
                                            <div className="prose">
                                                <PortableText value={teamMember.bio!} />
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </section>
    );
} 