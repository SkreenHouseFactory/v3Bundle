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

class ProgramController extends Controller
{
    private function blockDomain(Request $request) {
      if ($this->get('kernel')->getEnvironment() == 'prod' && 
          !strstr($request->getHost(), 'www.') && 
          !strstr($request->getHost(), 'preprod.') && 
          !strstr($request->getHost(), '.typhon.net')) {
        throw $this->createNotFoundException('Page does not exist');
      }
    }

    /**
    * saga program
    */
    public function sagaAction(Request $request)
    {
      $this->blockDomain($request);
      $api = $this->get('api');
      $data = $api->fetch('saga/'.$request->get('id'), array(
        'img_width' => 150,
        'img_height' => 200,
      ));
      //echo $api->url;
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
      $this->blockDomain($request);
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

      //API lastmodified
      //$data = $api->fetch('status/cache/program/' . $request->get('id'));
      // echo $api->url;
      //$cache_date = new \DateTime($data->updated_at);

      //cache
      $cache_maxage = 600;
      //$cache_etag = md5('program-' . $request->get('id') . '-'. $data->updated_at);

      // Créer un objet Response avec un en-tête ETag
      // et/ou un en-tête Last-Modified
      $response = new Response();
      //$response->setETag($cache_etag);
      //$response->setLastModified($cache_date);

      // Vérifier que l'objet Response n'est pas modifié
      // pour un objet Request donné
      if (false &&
           $this->get('kernel')->getEnvironment() != 'dev' && 
          $response->isNotModified($request)) {
          // Retourner immédiatement un objet 304 Response
          mail('benoit@myskreen.com',
               '[v3][program isNotModified] program-' . $request->get('id') . '-'. $data->updated_at,
               print_r($response, true));
      } else {
        //$response->expire();

        //echo $request->get('id');echo $request->get('_route');exit();
        $data = $api->fetch('program/'.$request->get('id'), array(
          'img_width' => 400,
          'img_height' => 550,
          'episode_img_width' => 80,
          'episode_img_height' => 50,
          'episode_img_crop' => 50,
          'channel_img_width' => 80,
          'channel_img_height' => 70,
          'with_img' => '273,368',
          'with_metadata' => true,
          'with_related' => true,
          'with_related_programs' => true,
          'with_selections' => true,
          'with_offers' => true,
          'with_teaser' => true,
          'with_hashtags' => true, 
          'with_tweets' => true,
          'with_empty_player' => true,
          'with_img_maxsize'=>true,
          'with_svod' => true,
          'slider_width' => 990,
          'slider_height' => 450
          //'wrap_default_description' => 'h2',
          //'filter_casting' => true,
          //'player' => 'flash'
        ));

        //print("<pre>");print_r($data);
        
        if ($this->get('kernel')->getEnvironment() == 'dev' && 
            $request->get('debug')) {
          echo $api->url;
        }

        //stop Adulte
        if (isset($data->error)) {
          throw $this->createNotFoundException('Program error : ' . $data->error);
        }
        //check url
        //echo $request->getPathInfo().' != '.$data->seo_url.' => '.($request->getPathInfo() != $data->seo_url);exit();
        //TODO
        if ($request->get('season_number')) {
          foreach ($data->seasons as $s) {
            if ($s->number == $request->get('season_number')) {
              return $this->redirect($s->episodes[0]->seo_url, 301);
            }
          }
          if ($this->get('kernel')->getEnvironment() == 'dev') {
            echo 'redirect fail : episode 1 saison '.$request->get('season_number');
            exit();
          }
          return $this->redirect($data->seo_url, 301);
        }
        if ($request->getPathInfo() != $data->seo_url) {
          if ($this->get('kernel')->getEnvironment() == 'dev') {
            return $this->redirect('/app_dev.php' . $data->seo_url, 301);;
          //  return new Response('redirect '.$request->getPathInfo().' != '.$data->seo_url.' => '.($request->getPathInfo() != $data->seo_url));
          }
          return $this->redirect($data->seo_url, 301);
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
        $data->description_text = strip_tags(html_entity_decode($data->description_seo));
        //episodes list
        if (!isset($data->episodeof) && 
            isset($data->datas_offers->episodes) && count((array)$data->datas_offers->episodes) > 1) {
          foreach ((array)$data->datas_offers->episodes as $e) {
            $data->episode_list[$e->title] = $e;
          }
          ksort($data->episode_list);
        }
        //list episode offers
        $data->offers_default = null;
        foreach ($data->offers as $type => $offers) {
          if (count($offers) > 0) {
            $data->offers_default = $type;
            break;
          }
        }
        //add other episodes offers
        //$data->offers = array_merge_recursive($data->offers, (array)$data->episodeof->offers);
        // ==> pas suffisant : il faut éviter la répetition lorsque l'on est sur un épisode
        if (isset($data->episodeof->offers)) {
          foreach ($data->episodeof->offers as $key => $offers) {
            foreach ($offers as $offer) {
              if (isset($offer->episode_id) && $offer->episode_id != $data->id) {
                $data->offers[$key][] = $offer;
              }
            }
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

        //player
        $data->player = null;
        if ($data->teaser) {
          $data->player = $data->teaser;
          $data->player->type = 'teaser';

        } else {
          if (count($data->offers['replay']) > 0) {
            foreach ($data->offers['replay'] as $o) {
              if (isset($o->deporte) && $o->deporte && !$o->cost) {
                $data->player = $o;
                $data->player->type = 'replay';
                break;
              }
            }
          }
          if (!$data->player && count($data->offers['deporte']) > 0) {
            foreach ($data->offers['deporte'] as $o) {
              if (isset($o->deporte) && $o->deporte && !$o->cost) {
                $data->player = $o;
                $data->player->type = 'deporte';
                break;
              }
            }
          }
          if (!$data->player && count($data->offers['bonus']) > 0) {
            foreach ($data->offers['bonus'] as $o) {
              if (isset($o->deporte) && 
                  $o->deporte && 
                  $o->channel_id != 5325) { //except cultcut
                $data->player = $o;
                $data->player->type = 'bonus';
                break;
              }
            }
          }
          if (!$data->player && count($data->offers['cut']) > 0) {
            foreach ($data->offers['cut'] as $o) {
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
        //load related programs
        $data->related = (array)$data->related;
        $data->selections = (array)$data->selections;
        /* now loaded in API
        foreach ($data->related as $key => $r) {
          $data->related[$key]->programs = (array)$api->fetch(str_replace('&onglet', '&_onglet', $r->url), array(
                                                      'img_width' => 150,
                                                      'img_height' => 200,
                                                      'programs_only' => true,
                                                      'channel_img_width' => 50,
                                                      'nb_results' => $r->paginate ? 7 : 50,
                                                    ));
          if (count($data->related[$key]->programs) > 0) {
            $data->has_related = true;
            //echo "\n name:".$r->name.' url:'.$api->url;
            //echo "\n name:".$r->name.' : '.end($data->related[$key]->programs)->id;
          }
        }
        */

        if (isset($data->sagas) && count((array)$data->sagas) > 0) {
          $data->related = array_merge((array)$data->sagas, $data->related);
        }

        if (array_key_exists('chaines',$data->related) && count($data->related['chaines']->programs) == 1) {
          $p = $data->related['chaines']->programs[0];
          // MODIFICATION DU FORMAT DE L'IMAGE DE LA CHAINE
          $p->picture = str_replace("/150/200/","/245/120/",$p->picture);
          $data->related['chaines']->programs[0] = $p;
        }

        if (strstr($data->title, ' - ')) {
          list($_, $data->episode_title) = explode(' - ', $data->title);
        }

        //footer
        list($_, $format, $__) = explode('/', $data->seo_url);
        $request->request->set('home', $format != 'programme' ? $format : null);
        
        $response = $this->render('SkreenHouseFactoryV3Bundle:Program:program-new.html.twig', array(
          'program' => $data,
          'offers' => array(
            'live' => 'En Direct', 
            'replay' => 'En Replay gratuit', 
            'deporte' => 'En 1 clic sur mySkreen', 
            'tv' => 'Les prochaines diffusions TV',
            'theater' => 'Au cinéma (horaires et salles)',
            'itunes' => 'Télécharger sur iTunes',
            'external' => 'Sur les autres sites', 
            'bonus' => 'Bonus',
            'cut' => 'Extraits',
            'archive' => 'Archives'
          ),
          'player_host' => $api->host
        ));
      }

      $response->setCache(array(
          //'etag'          => $cache_etag,
          //'last_modified' => $cache_date,
          'max_age'       => $cache_maxage,
          's_maxage'      => $cache_maxage,
          'public'        => true,
          // 'private'    => true,
      ));

      return $response;
    }
}