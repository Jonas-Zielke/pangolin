"use client";
import { useState, useEffect } from "react";
import { useEnvContext } from "@app/hooks/useEnvContext";
import { createApiClient } from "@app/lib/api";
import { toast } from "@app/hooks/useToast";
import {
    SettingsContainer,
    SettingsSection,
    SettingsSectionHeader,
    SettingsSectionTitle,
    SettingsSectionDescription,
    SettingsSectionBody,
    SettingsSectionForm,
    SettingsSectionFooter,
} from "@app/components/Settings";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function SecurityPage({ params }: { params: { orgId: string } }) {
    const { env } = useEnvContext();
    const api = createApiClient(useEnvContext());
    const t = useTranslations();
    const [synFlood, setSynFlood] = useState(false);
    const [icmpRate, setIcmpRate] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchStatus() {
            try {
                const res = await api.get(`/security`);
                if (res.status === 200) {
                    setSynFlood(res.data.data.syn_flood_protection);
                    setIcmpRate(res.data.data.icmp_rate_limit);
                }
            } catch (e) {}
        }
        fetchStatus();
    }, []);

    async function save() {
        setLoading(true);
        try {
            await api.post(`/security`, {
                syn_flood_protection: synFlood,
                icmp_rate_limit: icmpRate,
            });
            toast({ title: t("settingsSaved") });
        } catch (e) {
            toast({ variant: "destructive", title: t("error") });
        } finally {
            setLoading(false);
        }
    }

    return (
        <SettingsContainer>
            <SettingsSection>
                <SettingsSectionHeader>
                    <SettingsSectionTitle>
                        {t("securityPack")}
                    </SettingsSectionTitle>
                    <SettingsSectionDescription>
                        {t("securityPackDescription")}
                    </SettingsSectionDescription>
                </SettingsSectionHeader>
                <SettingsSectionBody>
                    <SettingsSectionForm>
                        <div className="flex items-center justify-between">
                            <label>{t("synFloodProtection")}</label>
                            <Switch
                                checked={synFlood}
                                onCheckedChange={setSynFlood}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <label>{t("icmpRateLimit")}</label>
                            <Input
                                value={icmpRate}
                                type="number"
                                onChange={(e) => setIcmpRate(Number(e.target.value))}
                                className="w-24 ml-2"
                            />
                        </div>
                    </SettingsSectionForm>
                </SettingsSectionBody>
                <SettingsSectionFooter>
                    <Button onClick={save} loading={loading}>
                        {t("saveSettings")}
                    </Button>
                </SettingsSectionFooter>
            </SettingsSection>
        </SettingsContainer>
    );
}
