// temporary data for services pages. This will be removed and fetched from Sanity

import PerformanceTraining from 'public/images/service/Performance Training.jpg';
import LifestyleMedicine from 'public/images/service/lifestyle-medicine.png';
import MentalHealth from 'public/images/service/mental-health.jpg';
import Recovery from 'public/images/service/recovery-sanctuary.jpg';
import Regenerative from 'public/images/service/regenerative-medicine.jpg';
import Rehab from 'public/images/service/rehab.jpg';
import SurgicalConsultation from 'public/images/service/surgical-consultation.jpg';

const body =
  'Ut ultricies nulla metus, sit amet convallis lectus suscipit sit amet. Sed non est purus. Duis condimentum, nisi vitae elementum lacinia, neque leo pharetra lacus, vitae iaculis dui odio eget neque. Ut ultricies nulla metus, sit amet convallis lectus suscipit sit amet. Sed non est purus. Duis condimentum, nisi vitae elementum lacinia, neque leo pharetra lacus, vitae iaculis dui odio eget neque. Sed non est purus. Duis condimentum, nisi vitae elementum lacinia, neque leo pharetra lacus, vitae iaculis dui odio eget neque. Ut ultricies nulla metus, sit amet convallis lectus suscipit sit amet.. Duis condimentum, nisi vitae elementum lacinia, neque leo pharetra lacus, vitae iaculis dui odio eget neque.';

export const servicesList = [
  {
    title: 'Lifestyle Medicine',
    id: 'lifestyle-medicine',
    image: LifestyleMedicine,
    body: body,
  },
  {
    title: 'Rehabilitation',
    id: 'rehabilitation',
    image: Rehab,
    body: body,
  },
  {
    title: 'Performance Training',
    id: 'performance-training',
    image: PerformanceTraining,
    body: body,
  },
  {
    title: 'Recovery Sanctuary',
    id: 'recovery-sancturary',
    image: Recovery,
    body: body,
  },
  {
    title: 'Regenerative Medicine',
    id: 'regenerative-medicine',
    image: Regenerative,
    body: body,
  },
  {
    title: 'Mental Health',
    id: 'mental-health',
    image: MentalHealth,
    body: body,
  },
  {
    title: 'Surgical Consultation',
    id: 'surgical-consultation',
    image: SurgicalConsultation,
    body: body,
  },
];
