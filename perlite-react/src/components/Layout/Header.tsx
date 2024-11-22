import { Group, Title } from '@mantine/core';

interface HeaderProps {
  children?: React.ReactNode;
}

export function Header({ children }: HeaderProps) {
  return (
    <Group h="100%" px="md" justify="space-between">
      <Group>
        {children}
        <Title order={3}>Perlite</Title>
      </Group>
      
      <Group>
        {/* Add theme toggle and other controls here */}
      </Group>
    </Group>
  );
}
