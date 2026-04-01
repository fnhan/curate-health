"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type CSSProperties,
} from "react";
import { set, unset, useClient, type StringInputProps } from "sanity";
import { Flex, Spinner, Stack, Text } from "@sanity/ui";

import { AUTHOR_TEAM_PROFILE_PAGE_ONLY } from "@/lib/author-team-link";

import { apiVersion } from "../env";

const TEAM_MEMBER_NAMES_QUERY = `*[_type == "ourTeam"][0].teamMembers[].name`;

/** Native selects often ignore theme vars; use explicit contrast for Studio. */
const selectStyle: CSSProperties = {
  width: "100%",
  maxWidth: "100%",
  boxSizing: "border-box",
  padding: "0.5rem 0.625rem",
  fontSize: "0.875rem",
  lineHeight: 1.4,
  border: "1px solid #94a3b8",
  borderRadius: 3,
  backgroundColor: "#ffffff",
  color: "#0f172a",
  colorScheme: "light",
};

const optionStyle: CSSProperties = {
  backgroundColor: "#ffffff",
  color: "#0f172a",
};

function uniqueSorted(
  names: (string | null | undefined)[],
): string[] {
  const trimmed = names
    .map((n) => (typeof n === "string" ? n.trim() : ""))
    .filter(Boolean);
  return [...new Set(trimmed)].sort((a, b) => a.localeCompare(b));
}

export default function TeamMemberNameSelect(props: StringInputProps) {
  const { value, onChange, readOnly, elementProps } = props;
  const client = useClient({ apiVersion });
  const [names, setNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    client
      .fetch<(string | null)[] | null>(TEAM_MEMBER_NAMES_QUERY)
      .then((rows) => {
        if (cancelled) return;
        setNames(uniqueSorted(rows ?? []));
        setError(null);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load Our Team members.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [client]);

  const valueStr = typeof value === "string" ? value : "";

  const options = useMemo(() => {
    const list = [...names];
    if (
      valueStr &&
      !list.includes(valueStr) &&
      valueStr !== AUTHOR_TEAM_PROFILE_PAGE_ONLY
    ) {
      list.unshift(valueStr);
    }
    return list;
  }, [names, valueStr]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const next = e.currentTarget.value;
      onChange(next ? set(next) : unset());
    },
    [onChange],
  );

  if (loading) {
    return (
      <Flex align="center" gap={3} paddingY={2}>
        <Spinner muted />
        <Text muted size={1}>
          Loading team members…
        </Text>
      </Flex>
    );
  }

  return (
    <Stack space={3}>
      {error ? (
        <Text size={1} style={{ color: "#e03e2d" }}>
          {error}
        </Text>
      ) : null}
      <select
        {...elementProps}
        value={valueStr}
        onChange={handleChange}
        disabled={readOnly}
        style={selectStyle}
      >
        <option value="" style={optionStyle}>
          — None —
        </option>
        <option value={AUTHOR_TEAM_PROFILE_PAGE_ONLY} style={optionStyle}>
          Curate Health Team
        </option>
        {options.map((name) => (
          <option key={name} value={name} style={optionStyle}>
            {names.includes(name)
              ? name
              : `${name} (not on Our Team page)`}
          </option>
        ))}
      </select>
      {valueStr &&
      !names.includes(valueStr) &&
      valueStr !== AUTHOR_TEAM_PROFILE_PAGE_ONLY ? (
        <Text muted size={1}>
          This value does not match anyone in About → Our Team. Clear it or
          update Our Team.
        </Text>
      ) : null}
    </Stack>
  );
}
