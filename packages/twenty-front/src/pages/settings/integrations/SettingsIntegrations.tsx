import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsIntegrationGroup } from '@/settings/integrations/components/SettingsIntegrationGroup';
import { useSettingsIntegrationCategories } from '@/settings/integrations/hooks/useSettingsIntegrationCategories';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { IconApps } from 'twenty-ui';

export const SettingsIntegrations = () => {
  const integrationCategories = useSettingsIntegrationCategories();

  return (
    <SubMenuTopBarContainer
      Icon={IconApps}
      title="Integrations"
      links={[
        {
          children: 'Workspace',
          href: getSettingsPagePath(SettingsPath.Workspace),
        },
        { children: 'Integrations' },
      ]}
    >
      <SettingsPageContainer>
        {integrationCategories.map((group) => (
          <SettingsIntegrationGroup key={group.key} integrationGroup={group} />
        ))}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
