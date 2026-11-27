#!/usr/bin/env python3
"""Negative controls: one synthetic mutation of the PUBLIC good file K1 per validity check. Usage: make_controls.py K1.ifc outdir
Prints MANIFEST lines  <file> <target check> <expect>  consumed by check_controls.py."""
import sys,os,re
src=open(sys.argv[1],newline='').read(); out=sys.argv[2]; os.makedirs(out,exist_ok=True)
def sub(s,old,new,count=1):
    assert s.count(old)>=1,(old,); return s.replace(old,new,count)
C={}
C['neg_STEP_footer_missing']=('V-STEP',sub(src,'END-ISO-10303-21;',''))
C['neg_SCHEMA_unofficial']=('V-SCHEMA',sub(src,"FILE_SCHEMA(('IFC4'))","FILE_SCHEMA(('IFC4X1'))"))
C['neg_REF_dangling']=('V-REF',sub(src,'#13=IFCPROJECT(','#13=IFCPROJECT(').replace('(#11),#14);','(#11),#99999);',1))
g=re.search(r"IFCWALL\('([^']{22})'",src).group(1)
C['neg_GUID_syntax_first_char']=('V-GUID',sub(src,"'"+g+"'","'9"+g[1:]+"'"))
g2=re.findall(r"IFCSLAB\('([^']{22})'",src)[0]
C['neg_GUID_duplicate']=('V-GUID',sub(src,"IFCWALL('"+g+"'","IFCWALL('"+g2+"'"))
C['neg_CTX_null']=('V-CTX',sub(src,"#73=IFCSHAPEREPRESENTATION(#12,","#73=IFCSHAPEREPRESENTATION($,"))
C['neg_ARITY_missing_arg']=('V-ARITY',sub(src,"'Jan B.',$,$,$,$,$,$);","'Jan B.',$,$,$,$,$);"))
C['neg_ATTR_mandatory_null']=('V-ATTR',sub(src,"#8=IFCCARTESIANPOINT((0.,0.,0.));","#8=IFCCARTESIANPOINT($);"))
C['neg_ATTR_star_in_explicit']=('V-ATTR',sub(src,"#9=IFCDIRECTION((0.,0.,1.));","#9=IFCDIRECTION(*);"))
C['neg_REQ_second_project']=('V-REQ',sub(src,"ENDSEC;\nEND-ISO","#99001=IFCPROJECT('3Ndyd$OSX7s9A04nc4lyyf',$,'second',$,$,$,$,(#11),#14);\nENDSEC;\nEND-ISO") if "ENDSEC;\nEND-ISO" in src else sub(src,"ENDSEC;\r\nEND-ISO","#99001=IFCPROJECT('3Ndyd$OSX7s9A04nc4lyyf',$,'second',$,$,$,$,(#11),#14);\r\nENDSEC;\r\nEND-ISO"))
with open(os.path.join(out,'MANIFEST.txt'),'w') as m:
    for k,(chk,txt) in C.items():
        open(os.path.join(out,k+'.ifc'),'w',newline='').write(txt); m.write('%s %s\n'%(k+'.ifc',chk))
print('wrote',len(C),'controls to',out)
