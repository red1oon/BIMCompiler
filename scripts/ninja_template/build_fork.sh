#!/bin/bash
# Build the Laos fork (CustomisedReport_tvcsap) as a local OSGi bundle "ExpenseReportFork" for the clone server ONLY.
# usage: build_fork.sh <source.java|.txt> <outjar>   ; strips the Spire licence key from the BUILD COPY (eval mode; PDF only).
set -e
SRC=$1; OUT=$2; H=$(cd "$(dirname "$0")" && pwd); W=$H/work; P=$HOME/idempiere-laos/server/plugins
rm -rf "$W"; mkdir -p "$W/src/org/my/process_tvcsap" "$W/src/org/idempiere/component" "$W/classes" "$W/jar/OSGI-INF" "$W/jar/lib" "$W/jar/META-INF"
tr -d '\r' < "$SRC" | sed -E 's/^\s*com\.spire\.license\.LicenseProvider\.setLicenseKey\(.*$/\t\t\t\/\/ licence key stripped from build copy/' > "$W/src/org/my/process_tvcsap/CustomisedReport_tvcsap.java"
cat > "$W/src/org/idempiere/component/ForkProcessFactory.java" <<'J'
package org.idempiere.component;
import org.adempiere.base.IProcessFactory; import org.compiere.process.ProcessCall;
public class ForkProcessFactory implements IProcessFactory {
  public ProcessCall newProcessInstance(String className) {
    if ("org.my.process.ExpenseReportFork".equalsIgnoreCase(className)) return new org.my.process_tvcsap.CustomisedReport_tvcsap();
    return null; } }
J
unzip -qo "$H/../../sourceforge/ERM.jar" lib/spire.xls-5.4.3.jar -d "$W/jar"
CP="$P/org.adempiere.base_13.0.0.202601182106.jar:$P/org.adempiere.base.process_13.0.0.202601182106.jar:$P/wrapped.org.apache.poi.poi_5.2.2.jar:$P/com.github.librepdf.openpdf_1.3.39.bcfips.jar:$W/jar/lib/spire.xls-5.4.3.jar:$P/org.osgi.service.component.annotations_1.5.1.202212101352.jar"
for j in $P/org.adempiere.base_*.jar; do :; done
javac -nowarn -encoding UTF-8 -cp "$CP:$(ls $P/*.jar | tr '\n' ':')" -d "$W/classes" $(find "$W/src" -name '*.java') 2>&1 | grep -v "^Note:" | head -30
cp -r "$W/classes/"* "$W/jar/"
cat > "$W/jar/OSGI-INF/ForkProcessFactory.xml" <<'X'
<?xml version="1.0" encoding="UTF-8"?>
<scr:component xmlns:scr="http://www.osgi.org/xmlns/scr/v1.1.0" name="org.idempiere.component.ForkProcessFactory">
   <property name="service.ranking" type="Integer" value="3"/>
   <service><provide interface="org.adempiere.base.IProcessFactory"/></service>
   <implementation class="org.idempiere.component.ForkProcessFactory"/>
</scr:component>
X
cat > "$W/jar/META-INF/MANIFEST.MF" <<'M'
Manifest-Version: 1.0
Bundle-ManifestVersion: 2
Bundle-Name: ExpenseReportFork (local oracle build)
Bundle-SymbolicName: ExpenseReportFork;singleton:=true
Bundle-Version: 1.0.0.local
Bundle-ActivationPolicy: lazy
Require-Bundle: org.adempiere.base,org.adempiere.base.process,wrapped.org.apache.poi.poi,com.github.librepdf.openpdf
Import-Package: org.osgi.service.component.annotations,org.apache.commons.logging;resolution:=optional,org.slf4j;resolution:=optional
Service-Component: OSGI-INF/*.xml
Bundle-ClassPath: .,lib/spire.xls-5.4.3.jar
M
(cd "$W/jar" && jar cfm "$OUT" META-INF/MANIFEST.MF .)
ls -la "$OUT"
