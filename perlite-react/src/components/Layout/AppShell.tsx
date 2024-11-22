import { AppShell as MantineAppShell, Burger } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Navbar } from './Navbar';
import { Header } from './Header';

interface AppShellProps {
  children: React.ReactNode;
  onFileSelect: (filePath: string) => void;
}

export function AppShell({ children, onFileSelect }: AppShellProps) {
  const [opened, { toggle }] = useDisclosure();

  return (
    <MantineAppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <MantineAppShell.Header>
        <Header>
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        </Header>
      </MantineAppShell.Header>

      <MantineAppShell.Navbar>
        <Navbar onFileSelect={onFileSelect} />
      </MantineAppShell.Navbar>

      <MantineAppShell.Main>
        {children}
      </MantineAppShell.Main>
    </MantineAppShell>
  );
}
