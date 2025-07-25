"use client";

import { useState, use } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useResourceContext } from "@app/hooks/useResourceContext";
import { useEnvContext } from "@app/hooks/useEnvContext";
import { createApiClient } from "@app/lib/api";
import { toast } from "@app/hooks/useToast";
import DomainPicker from "@app/components/DomainPicker";
import { TagInput } from "@app/components/tags/tag-input";
import { Button } from "@/components/ui/button";
import { useRouter, useParams } from "next/navigation";
import {
    SettingsContainer,
    SettingsSection,
    SettingsSectionHeader,
    SettingsSectionTitle,
    SettingsSectionDescription,
    SettingsSectionBody,
    SettingsSectionFooter
} from "@app/components/Settings";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage
} from "@app/components/ui/form";
import CopyTextBox from "@app/components/CopyTextBox";

const formSchema = z.object({
    tags: z.array(z.string()).optional(),
    subdomain: z.string().optional(),
    domainId: z.string().optional()
});

export default function ResourceTunnelPage(props: { params: Promise<{ resourceId: number; orgId: string }> }) {
    const params = use(props.params);
    const { resource, updateResource } = useResourceContext();
    const { env } = useEnvContext();
    const api = createApiClient({ env });
    const router = useRouter();
    const t = useTranslations();

    const initialTags: string[] = resource.tags ? JSON.parse(resource.tags) : [];

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            tags: initialTags,
            subdomain: resource.subdomain ?? undefined,
            domainId: resource.domainId ?? undefined
        }
    });

    const [saveLoading, setSaveLoading] = useState(false);

    async function onSubmit(data: z.infer<typeof formSchema>) {
        setSaveLoading(true);
        const res = await api
            .post(`resource/${params.resourceId}`, {
                tags: data.tags,
                domainId: data.domainId,
                subdomain: data.subdomain
            })
            .catch((e) => {
                toast({
                    variant: "destructive",
                    title: t("resourceErrorUpdate"),
                    description: e.message
                });
            });

        if (res && res.status === 200) {
            toast({ title: t("resourceUpdated"), description: t("resourceUpdatedDescription") });
            updateResource(res.data.data);
            router.refresh();
        }
        setSaveLoading(false);
    }

    const entrypoints = `entryPoints:\n  ${resource.protocol}-${resource.proxyPort}:\n    address: ":${resource.proxyPort}/${resource.protocol}"`;
    const composePorts = `ports:\n  - ${resource.proxyPort}:${resource.proxyPort}${resource.protocol === "tcp" ? "" : "/" + resource.protocol}`;

    return (
        <SettingsContainer>
            <SettingsSection>
                <SettingsSectionHeader>
                    <SettingsSectionTitle>{t("tunnel")}</SettingsSectionTitle>
                    <SettingsSectionDescription>
                        {t("exitNodeTagsDescription")}
                    </SettingsSectionDescription>
                </SettingsSectionHeader>
                <SettingsSectionBody>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="tags"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>{t("exitNodeTags")}</FormLabel>
                                        <TagInput tags={field.value || []} setTags={field.onChange} placeholder="Add tags" />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="domainId"
                                render={() => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>{t("domain")}</FormLabel>
                                        <DomainPicker
                                            orgId={params.orgId}
                                            onDomainChange={(res) => {
                                                form.setValue("domainId", res.domainId);
                                                form.setValue("subdomain", res.subdomain);
                                            }}
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <SettingsSectionFooter>
                                <Button type="submit" loading={saveLoading} disabled={saveLoading}>{t("saveSettings")}</Button>
                            </SettingsSectionFooter>
                        </form>
                    </Form>
                </SettingsSectionBody>
            </SettingsSection>
            <SettingsSection>
                <SettingsSectionHeader>
                    <SettingsSectionTitle>{t("resourceConfig")}</SettingsSectionTitle>
                    <SettingsSectionDescription>
                        {t("resourceConfigDescription")}
                    </SettingsSectionDescription>
                </SettingsSectionHeader>
                <SettingsSectionBody>
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">{t("resourceAddEntrypoints")}</h3>
                            <CopyTextBox text={entrypoints} wrapText={false} />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">{t("resourceExposePorts")}</h3>
                            <CopyTextBox text={composePorts} wrapText={false} />
                        </div>
                    </div>
                </SettingsSectionBody>
            </SettingsSection>
        </SettingsContainer>
    );
}
