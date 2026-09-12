import type { Settings } from '@/lib/types';
import { marckScript, poppins } from '@/lib/fonts';
import { RsvpTrigger } from './RsvpTrigger';

export function Hero({ settings }: { settings: Settings }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        paddingBottom: 27,
        background: 'black',
        overflow: 'hidden',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        display: 'inline-flex',
      }}
    >
      <div style={{ width: 1404, height: 789.75, position: 'relative' }}>
        <div
          style={{
            width: 1404,
            height: 789.75,
            left: 0,
            top: 0,
            position: 'absolute',
            background:
              'linear-gradient(180deg, #D9D9D9 0%, rgba(158.64, 158.64, 158.64, 0.17) 57%, rgba(115, 115, 115, 0) 100%)',
          }}
        />
        {settings.hero_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            style={{ width: 1404, height: 1008.39, left: 0, top: 0, position: 'absolute', objectFit: 'cover' }}
            src={settings.hero_image_url}
            alt=""
          />
        )}
        <div style={{ width: 1404, height: 1008.39, left: 0, top: 0, position: 'absolute' }}>
          {settings.hero_image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              style={{ width: 1404, height: 1008.39, left: 0, top: 0, position: 'absolute', objectFit: 'cover' }}
              src={settings.hero_image_url}
              alt=""
            />
          )}
          <div
            style={{
              width: 1157.01,
              height: 187.66,
              left: 123.26,
              top: 161,
              position: 'absolute',
              textAlign: 'center',
              color: 'white',
              fontSize: 147.73,
              fontFamily: marckScript.style.fontFamily,
              fontWeight: '400',
              wordWrap: 'break-word',
              textShadow: '-2px 5px 5px rgba(0, 0, 0, 0.55)',
            }}
          >
            {settings.couple_names}
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            style={{ width: 152, height: 103.39, left: 631, top: 285, position: 'absolute' }}
            src="/hero/couple.png"
            alt=""
          />
        </div>
        <div style={{ width: 237, height: 51.87, left: 583, top: 493, position: 'absolute', background: 'white', borderRadius: 8.78 }}>
          <a
            href="#our-story"
            style={{
              width: 237,
              height: 51.87,
              left: 0,
              top: 0,
              position: 'absolute',
              overflow: 'hidden',
              justifyContent: 'center',
              alignItems: 'center',
              display: 'inline-flex',
            }}
          >
            <div
              style={{
                textAlign: 'center',
                color: '#170E01',
                fontSize: 19.15,
                fontFamily: poppins.style.fontFamily,
                fontWeight: '600',
                wordWrap: 'break-word',
              }}
            >
              GET STARTED
            </div>
          </a>
        </div>
        <div style={{ left: 836, top: 493, position: 'absolute' }}>
          <RsvpTrigger />
        </div>
      </div>
    </div>
  );
}
