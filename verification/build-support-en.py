from pathlib import Path
import importlib.util,json,re
root=Path(__file__).parent
outroot=root.parent if root.name=='verification' else root
spec=importlib.util.spec_from_file_location('support_ru',root/'build-support.py')
ru=importlib.util.module_from_spec(spec);spec.loader.exec_module(ru)
text=(outroot/'underground-support.html').read_text()
# Economics/Bishop functions are not used in the support tool.
text=text.replace(ru.base.engine+'\n','',1)
translations=json.loads((root/'support-en.json').read_text())
for a,b in sorted(translations.items(),key=lambda kv:-len(kv[0])):text=text.replace(a,b)
text=text.replace("'ru-RU'","'en-GB'").replace('lang="ru"','lang="en"')
# Localize page/report links, contact attribution, and export file names.
text=text.replace('UG-SUPPORT-RU','UG-SUPPORT-EN').replace('UG Support RU','UG Support EN')
text=text.replace("Tool: https://gornyak0505-pixel.github.io/geomechanics-demo/underground-support.html", "Tool: https://gornyak0505-pixel.github.io/geomechanics-demo/underground-support-en.html")
text=text.replace('underground-support-preliminary-report.html','underground-support-preliminary-report-en.html').replace('support-comparison.csv','support-comparison-en.csv')
text=text.replace('<span aria-current="page">Russian</span><a href="underground-support-en.html" lang="en" hreflang="en">English</a>', '<a href="underground-support.html" lang="ru" hreflang="ru">Русский</a><span aria-current="page">English</span>')
text=text.replace('<a href="underground-support.html">Underground support</a>', '<a href="underground-support-en.html">Underground support</a>')
left=re.findall(r'.{0,65}[А-Яа-яЁё].{0,100}',text.replace('>Русский<','>Russian<'))
if left:raise ValueError('Untranslated text:\n'+'\n'.join(left))
(outroot/'underground-support-en.html').write_text(text)
print('Built English support page; complete translation check passed.')
