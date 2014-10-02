<?php

/*
 * This file is part of the SkreenHouseFactoryV3Bundle package.
 *
 * (c) Brickstorm <http://brickstorm.org/>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace SkreenHouseFactory\v3Bundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

use SkreenHouseFactory\v3Bundle\Api\ApiManager;

use Symfony\Component\HttpFoundation\Cookie;

class ProgramController extends Controller
{

    /**
    * saga program
    */
    public function sagaAction(Request $request)
    {
      $api = $this->get('api');
      $data = $api->fetch('saga/'.$request->get('id'), array(
        'img_width' => 150,
        'img_height' => 200,
      ));
      //echo $api->url;exit;
      $response = $this->render('SkreenHouseFactoryV3Bundle:Program:saga.html.twig', array(
        'saga' => $data
      ));

      $maxage = 3600;
      $response->setPublic();
      $response->setMaxAge($maxage);
      $response->setSharedMaxAge($maxage);
    
      return $response;
    }

    /**
    * program
    */
    public function programAction(Request $request)
    {
      $api = $this->get('api');

      //redirect v1 route
      if ($request->get('from_occurrence')) {
        $data = $api->fetch('player/'.$request->get('id'), array(
          'with_program' => true
        ));
        if ($data->program && $data->program->id) {
          return $this->redirect($data->program->seo_url, 301);
        } else {
          return $this->redirect('/');
        }
      }

      //echo $request->get('id');echo $request->get('_route');exit();
      $data = $api->fetch('program/'.$request->get('id'), array(
        'img_width' => 273,
        'img_height' => 368,
        'related_img_width' => 150,
        'related_img_height' => 200,
        'episode_img_width' => 100,
        'episode_img_height' => 90,
        'episode_img_crop' => 50,
        'channel_img_width' => 80,
        'channel_slider_width' => 300,
        'channel_slider_height' => 147,
        'slider_width' => 1200,
        'slider_height' => 630,
        'season' => $request->get('season_number'),
        'fields' => 'description_episode,metadata,related,related_programs,selections,offers,teaser,hashtags,tweets,empty_player,img_maxsize,svod,coming_soon,homes,photo,reviews'
      ));

      //gestion og_picture
      if (isset($data->sliderPicture)) {
        $data->og_picture = $data->sliderPicture;
      }

      //echo $api->url;exit;
      if ($this->get('kernel')->getEnvironment() == 'dev' && 
          $request->get('debug')) {
        echo $api->url;
      }

      //hack bug API renvoie rien
      if (!is_object($data)) {
        if ($this->get('kernel')->getEnvironment() == 'dev') {
          print("<pre style='position:absolute;'>NON OBJECT RESPONSE");print_r($data);print("</pre>");exit();
        }
        //on réessaie un fois
        if (!$request->get('is_retry_api')) {
          $request->request->set('is_retry_api', true);
          return $this->programAction($request);
        }
      }

      //hack 301 sketch inconnus redirect sur integrale
      /*if (isset($data->episodeof) && 
          isset($data->episodeof->id) && 
          in_array($data->episodeof->id, array(4941177,4938680,5300091,5300092,5300093,5300095,5300097,4941165,4941207))) {
        return $this->redirect('/l-integrale-des-inconnus/?click=[data-id=%22'.$data->id.'%22]', 301);
      }*/
      //hack 301 sketch inconnus redirect sur FP 3 freres le retour
      if (isset($data->episodeof) && 
          isset($data->episodeof->id) && 
          in_array($data->episodeof->id, array(4941177,4938680,5300091,5300092,5300093,5300095,5300097,4941165,4941207))) {
        return $this->redirect('/film/comedies/5088919-les-trois-freres-le-retour/', 301);
      }

      //stop Adulte
      if (!$data || isset($data->error)) {
        switch ($request->attributes->get('_route')) {
          case 'program_pere':
            $response = new Response();
            $response->headers->setCookie(new Cookie('myskreen_404', $request->getUri()), time()+3600);
            return $this->redirect($this->generateUrl('category', array(
              'format' => $request->get('format'),
              'category_slug' => $request->get('categorie')
            )), 301);
          break;
          case 'program_fils':
          case 'program_fils_saison':
            $response = new Response();
            $response->headers->setCookie(new Cookie('myskreen_404', $request->getUri()), time()+3600);
            return $this->redirect($this->generateUrl('program_pere', array(
              'format' => $request->get('format'),
              'categorie' => $request->get('categorie'),
              'id' => $request->get('idpere'),
              'slug' => $request->get('slugpere')
            )), 301);
          break;
          default:
            throw $this->createNotFoundException('Program error : ' . $data->error);
          break;
        }
      }
      if (!$request->get('season_number')) {
        if  ($request->getPathInfo() != $data->seo_url) {
          if ($this->get('kernel')->getEnvironment() == 'dev') {
            return $this->redirect('/app_dev.php' . $data->seo_url, 301);;
          //  return new Response('redirect '.$request->getPathInfo().' != '.$data->seo_url.' => '.($request->getPathInfo() != $data->seo_url));
          }
          return $this->redirect($data->seo_url, 301);
        }
      }

      //hack img dev
      if ($request->get('imgdev')) {
        $data->img = preg_replace('/s(\d)\.mskstatic.com/', 'mskstatic.dev-new.myskreen.typhon.net', $data->img);
      }
      //hack rename API
      if (isset($data->related->chaines)) {
        $data->related->channels = $data->related->chaines;
        unset($data->related->chaines);
      }

      // -- post treatments
      $data->offers = (array)$data->offers;

      //description with html_entity_decode
      $data->description_text = strip_tags(html_entity_decode($data->description));
      //episodes list
      if (!isset($data->episodeof) && 
          isset($data->datas_offers->episodes) && count((array)$data->datas_offers->episodes) > 1) {
        $ksort = false;
        foreach ((array)$data->datas_offers->episodes as $e) {
          $key = 0;
          if (isset($e->season_number) && $e->season_number) {
            $key = (int)$e->season_number*100;
          }
          if (isset($e->episode_number) && $e->episode_number) {
            $key = $key + (int)$e->episode_number;
          }
          if (!$key) {
            $key .= $e->title;
            $ksort = true;
          }
          //echo "\n:".$key;
          $data->episode_list[$key] = $e;
        }
        if ($ksort) {
          ksort($data->episode_list);
        }
      }

      //add live
      $data->offers['live'] = array();
      foreach ((array)$data->offers['tv'] as $o) {
        if ($o->broadcasttime < time() &&
            $o->endtime > time()) {
          //echo "\n".'addLive broadcasttime:'.date('Ymd H:i:s', $o->broadcasttime).' endtime:'.date('Ymd H:i:s', $o->endtime).' time:'.date('Ymd H:i:s', time());
          $data->offers['live'][] = $o;
        }
      }
      $data->offers['live'] = (object)$data->offers['live'];

      $this->definePlayer($data, $data->offers);

      if (!$data->player && isset($data->episodeof) && isset($data->episodeof->offers) && $data->episodeof->offers){
        $this->definePlayer($data, $data->episodeof->offers);
      }
   
      //add other episodes offers
      //$data->offers = array_merge_recursive($data->offers, (array)$data->episodeof->offers);
      // ==> pas suffisant : il faut éviter la répetition lorsque l'on est sur un épisode
      if (isset($data->episodeof->offers)) {
        foreach ($data->episodeof->offers as $key => $offers) {
          $data->offers[$key] = (array)$data->offers[$key];
          foreach ($offers as $offer) {
            if (isset($offer->episode_id) && $offer->episode_id != $data->id) {
              //$data->offers[$key] = (array)$data->episodeof->offers->{$key};
              $data->offers[$key][] = $offer;
            }
          }
          $data->offers[$key] = (object)$data->offers[$key];
        }
      }
      //theaters     
      if (!$data->offers['theater'] && !$data->offers['theater_on_demand']) {
        $data->offers['theater'] = array();
      } else {
        $data->datas_theaters = array(
          'theaters_ids' => $data->offers['theater'] ? explode(',', $data->offers['theater']) : array(),
          'theater_on_demand' => $data->offers['theater_on_demand']
        );
        $data->offers['theater'] = ($data->offers['theater'] ? count($data->offers['theater']) : 0) +  
                                   ($data->offers['theater_on_demand'] ? count($data->offers['theater_on_demand']) : 0);
      }

      
      //load related programs
      $data->related = isset($data->related) ? (array)$data->related : array();
      $data->selections = isset($data->selections) ? (array)$data->selections : array();

      if (isset($data->sagas) && count((array)$data->sagas) > 0) {
        $data->related = array_merge((array)$data->sagas, $data->related);
      }

      if (array_key_exists('chaines',$data->related) && count($data->related['chaines']->programs) == 1) {
        $p = $data->related['chaines']->programs[0];
        // MODIFICATION DU FORMAT DE L'IMAGE DE LA CHAINE
        $p->picture = str_replace("/150/200/","/245/120/",$p->picture);
        $data->related['chaines']->programs[0] = $p;
      }

      if (strstr($data->title, ' - ') && !isset($data->episodeof) ) {
        list($_, $data->episode_title) = explode(' - ', $data->title);
      }

      //footer
      list($_, $format, $__) = explode('/', $data->seo_url);
      $request->request->set('home', $format != 'programme' ? $format : null);

      $voirOffres = array(
        'live' => 'En Direct', 
        'replay' => 'En Replay gratuit', 
        'deporte' => 'En intégralité sur mySkreen', 
        'tv' => 'Les prochaines diffusions TV',
        'theater' => 'Au cinéma (horaires et salles)',
        'itunes' => 'Télécharger sur iTunes',
        'external' => 'Sur les autres sites', 
        'box' => 'Sur les Box', 
        'console' => 'Sur les consoles', 
        'dvd' => 'DVD & Blu-Ray',
        'archive' => 'Archives',
        'coming_soon'=> 'Bientôt disponible',
      );

      $voirCount = 0;
      foreach ($voirOffres as $type => $value) {
        if (isset($data->offers[$type])) {
          $voirCount = $voirCount + count((array)$data->offers[$type]);
        }
      }

      $videosOffres = array(
        'bonus' => 'Bonus',
        'cut' => 'Extraits'
      );

      $videosCount = isset($data->teaser) ? 1 : 0;
      foreach ($videosOffres as $type => $value) {
        if (isset($data->offers[$type])) {
          $videosCount = $videosCount + count((array)$data->offers[$type]);
        }
      }

      // Tableau casting avec photos
      $casting_photos = array();
      if (isset($data->casting)) {
        foreach ($data->casting as $relation => $persons) {
          foreach ($persons as $person) {
            if (in_array($relation, array('Présentateur','Acteur','Réalisateur'))) {
              if (!isset($casting_photos[$person->id])) {
                if (isset($person->photo) && $person->photo) {
                  $casting_photos[$person->id] = $person;
                }
              }
            }
          }
        }
      }
      

      //cache
      $cache_maxage = 600;
      $response = $this->render('SkreenHouseFactoryV3Bundle:Program:program-v3.html.twig', array(
        'program' => $data,
        'voir' => array(
          'offers' => $voirOffres,
          'count' => $voirCount,
        ),
        'videos' => array(
          'offers' => $videosOffres,
          'count' => $videosCount,
        ),
        'player_host' => $api->host,
        'casting_photos' => $casting_photos
      ));

      $response->setCache(array(
          'max_age'       => $cache_maxage,
          's_maxage'      => $cache_maxage,
          'public'        => true
      ));

      return $response;
    }


    /**
    * episodeslist
    */
    public function episodeslistAction(Request $request)
    {
      $api = $this->get('api');
      $data = $api->fetch('program/'.$request->get('id'), array(
        'episode_img_width' => 100,
        'episode_img_height' => 90,
        'episode_img_crop' => 50,
        'fields' => 'metadata,description_episode,offers,seasons'
      ));
      if (isset($data->datas_offers) && isset($data->datas_offers->episodes)) {
        $data->episode_list = $data->datas_offers->episodes;
      }
      //print_r($data);
      $template = isset($data->episodeof) && isset($data->season_number) ? 'v3_episodes-saison' : 'v3_episodes';
      $response = $this->render('SkreenHouseFactoryV3Bundle:Program:program-'.$template.'.html.twig', array(
        'program' => $data,
      ));

      $cache_maxage = 3600;
      $response->setCache(array(
          'max_age'       => $cache_maxage,
          's_maxage'      => $cache_maxage,
          'public'        => true,
      ));
      return $response;
    }

    protected function definePlayer(&$data, $offers)
    {
      //player
      $data->player = null;
      $offers = (array)$offers;
      $live = isset($offers['live']) ? (array)$offers['live'] : array();
      if (isset($live[0]) &&
          isset($data->datas_offers->channels->{$live[0]->channel_id}) &&
          isset($data->datas_offers->channels->{$live[0]->channel_id}->live->player)) {
        $data->player = $live[0];
        $data->player->type = 'live';
        $data->player->iframe = $data->datas_offers->channels->{$live[0]->channel_id}->live->player;
        $data->best_offer = $live[0];
        $data->best_offer->offer_type = 'live';
        $data->best_offer->channel = $data->datas_offers->channels->{$live[0]->channel_id};
        if (isset($o->episode_id)) {
          $data->best_offer->episode = $data->datas_offers->episodes->{$live[0]->episode_id};
        }

      } elseif ($data->teaser &&
                (
                  !isset($data->episodeof) || 
                  !$data->episodeof ||
                  $data->teaser->program_id == $data->id || 
                  (
                    (!isset($offers['bonus']->{0}) || !$offers['bonus']->{0}->deporte || (isset($offers['bonus']->{0}->episode_id) && $offers['bonus']->{0}->episode_id != $data->id)) && 
                    (!isset($offers['cut']->{0}) || !$offers['cut']->{0}->deporte || (isset($offers['cut']->{0}->episode_id) && $offers['cut']->{0}->episode_id != $data->id))
                  )
                ) && 
                (!isset($offers['replay']->{0}) || !$offers['replay']->{0}->deporte) && 
                (!isset($offers['deporte']->{0}) || $offers['deporte']->{0}->cost)) {
        $data->player = $data->teaser;
        $data->player->type = 'teaser';

      } else {
        if (isset($offers['replay']) && count($offers['replay']) > 0) {
          foreach ($offers['replay'] as $o) {
            if (isset($o->deporte) && $o->deporte && !$o->cost) {
              $data->player = $o;
              $data->player->type = 'replay';
              break;                
            }
          }
        }
        if (!$data->player && isset($offers['deporte']) && count($offers['deporte']) > 0) {
          foreach ($offers['deporte'] as $o) {
            if (isset($o->deporte) && $o->deporte && !$o->cost) {
              $data->player = $o;
              $data->player->type = 'deporte';
              break;
            }
          }
        }
        if (!$data->player && isset($offers['bonus']) && count($offers['bonus']) > 0) {
          foreach ($offers['bonus'] as $o) {
            if (isset($o->deporte) && 
                $o->deporte && 
                $o->channel_id != 5325) { //except cultcut
              $data->player = $o;
              $data->player->type = 'bonus';
              break;
            }
          }
        }
        if (!$data->player && isset($offers['cut']) && count($offers['cut']) > 0) {
          foreach ($offers['cut'] as $o) {
            if (isset($o->deporte) && 
                $o->deporte && 
                $o->channel_id != 5325) { //except cultcut
              $data->player = $o;
              $data->player->type = 'cut';
              break;
            }
          }
        }
      }
    }
}