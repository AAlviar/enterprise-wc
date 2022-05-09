// Supporting components
import '../../ids-search-field/ids-search-field';
import '../../ids-toolbar/ids-toolbar';
import '../ids-header';

// Other Pages
import '../../ids-breadcrumb/ids-breadcrumb';
import '../../ids-hyperlink/ids-hyperlink';
import '../../ids-checkbox/ids-checkbox';
import '../../ids-theme-switcher/ids-theme-switcher';

// Listing Page
import '../../ids-demo-app/ids-demo-listing';
import indexYaml from './index.yaml';

const demoListing: any = document.querySelector('ids-demo-listing');
if (demoListing) {
  demoListing.data = indexYaml.examples;
}
